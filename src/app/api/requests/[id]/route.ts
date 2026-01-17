
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

        // Extract allowed fields to update
        const { assignedExpertId, status, visibility, requiredSkills } = body;

        const dataToUpdate: any = {};
        if (assignedExpertId !== undefined) dataToUpdate.assignedExpertId = assignedExpertId;
        if (status !== undefined) dataToUpdate.status = status;
        if (visibility !== undefined) dataToUpdate.visibility = visibility;
        if (requiredSkills !== undefined) dataToUpdate.requiredSkills = typeof requiredSkills === 'object' ? JSON.stringify(requiredSkills) : requiredSkills;

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
