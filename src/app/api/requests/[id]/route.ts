
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        console.log(`[PATCH Request] ID: ${id}`, body);

        // Extract allowed fields to update
        const { assignedExpertId, status, visibility, requiredSkills } = body;

        const dataToUpdate: any = {};
        if (assignedExpertId !== undefined) dataToUpdate.assignedExpertId = assignedExpertId;
        if (status !== undefined) dataToUpdate.status = status;
        if (visibility !== undefined) dataToUpdate.visibility = visibility;
        if (requiredSkills !== undefined) dataToUpdate.requiredSkills = requiredSkills;

        // Auto-update timestamps based on status change
        if (status === 'IN_PROGRESS') {
            dataToUpdate.workStartedAt = new Date();
        }
        if (status === 'REVIEW_CLIENT' || status === 'REVIEW_ADMIN') {
            dataToUpdate.completedAt = new Date();
        }

        // --- Logic for "OPEN POOL" ---
        if (visibility === 'OPEN') {
            // 1. Ensure status allows opening (e.g. NEW)
            // Note: Frontend might send status 'MATCHED' by mistake, ensure we control logic if needed. 
            // The User requested: "Request status will remain the same as "New" until expert accept it"

            // 2. Clear assigned expert if opening pool
            dataToUpdate.assignedExpertId = null;

            // 3. Find relevant experts (Active & Approved)
            // For now, we invite ALL active experts. In future, filter by skills.
            const activeExperts = await prisma.expert.findMany({
                where: {
                    status: 'ACTIVE',
                    // kycStatus: 'APPROVED' // Uncomment if strict KYC needed
                },
                select: { id: true }
            });

            if (activeExperts.length > 0) {
                // Upsert pool invites: Create if not exists
                // We use a transaction or just loop for safety
                for (const expert of activeExperts) {
                    await prisma.providerPool.upsert({
                        where: {
                            requestId_expertId: {
                                requestId: id,
                                expertId: expert.id
                            }
                        },
                        update: { status: 'INVITED' },
                        create: {
                            requestId: id,
                            expertId: expert.id,
                            status: 'INVITED'
                        }
                    });
                }
            }
        }
        else if (visibility === 'ASSIGNED' && assignedExpertId) {
            // If switching back to assigned, we might want to clear pool invites or mark them invalid?
            // For now, just setting assignedExpertId is enough, frontend logic handles the rest.
        }

        const updatedRequest = await prisma.request.update({
            where: { id },
            data: dataToUpdate
        });

        // --- INVOICE GENERATION LOGIC ---
        // Verify if we should generate an invoice
        // Trigger: status changing to 'NEW' (implies payment)
        if (status === 'NEW') {
            // Check if invoice already exists to prevent duplicates
            const existingInvoice = await prisma.invoice.findFirst({
                where: { requestId: id }
            });

            if (!existingInvoice) {
                try {
                    // Fetch request to get amount if not in body
                    // (Actually, 'updatedRequest' has the data? update returns the new object)
                    // But 'amount' might not be in 'updatedRequest' if it wasn't updated, 
                    // unless we selected it or rely on prisma return.
                    // Prisma update returns all scalar fields by default.

                    const subtotal = Number(updatedRequest.amount);
                    const vat = subtotal * 0.15;
                    const totalAmount = subtotal + vat;

                    // Create Invoice
                    const invoice = await prisma.invoice.create({
                        data: {
                            clientId: updatedRequest.clientId,
                            requestId: updatedRequest.id,
                            amount: totalAmount,
                            status: 'PAID',
                            // seqId auto-increments
                        }
                    });

                    // Update Display ID
                    const invDisplayId = `INV-${String(invoice.seqId).padStart(8, '0')}`;
                    await prisma.invoice.update({
                        where: { id: invoice.id },
                        data: { displayId: invDisplayId }
                    });

                    console.log(`[REQ_UPDATE] Generated Invoice ${invDisplayId} for Request ${updatedRequest.displayId}`);

                    // Update Request with Invoice Display ID
                    await prisma.request.update({
                        where: { id: updatedRequest.id },
                        data: { invoiceDisplayId: invDisplayId }
                    });

                } catch (invError) {
                    console.error("[REQ_UPDATE] Failed to generate invoice:", invError);
                }
            } else {
                console.log(`[REQ_UPDATE] Invoice already exists for Request ${id}, skipping.`);
            }
        }

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Failed to update request:", error);
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.request.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete request:", error);
        return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }
}
