
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { headers } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { expertId } = body;

        if (!expertId) {
            return NextResponse.json({ error: 'Expert ID is required' }, { status: 400 });
        }

        // 1. Verify Request is 'NEW' and Open for this expert
        // We can be strict and check `visibility === 'OPEN'` or `poolInvites`
        const req = await prisma.request.findUnique({
            where: { id },
            include: { poolInvites: true }
        });

        if (!req) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        if (req.assignedExpertId) {
            return NextResponse.json({ error: 'Request is already assigned' }, { status: 409 });
        }

        // 2. Assign the expert
        // We use a transaction to ensure atomicity
        const result = await prisma.$transaction(async (tx) => {
            // Update Request
            const updated = await tx.request.update({
                where: { id },
                data: {
                    assignedExpertId: expertId,
                    status: 'MATCHED',
                    visibility: 'ASSIGNED' // Close the pool
                }
            });

            // Update this expert's invite to ACCEPTED
            await tx.providerPool.upsert({
                where: {
                    requestId_expertId: {
                        requestId: id,
                        expertId: expertId
                    }
                },
                update: { status: 'ACCEPTED' },
                create: {
                    requestId: id,
                    expertId: expertId,
                    status: 'ACCEPTED'
                }
            });

            // Optionally: Mark others as declined or closed?
            // For now, we leave them as INVITED (or could be ignored by UI since request is assigned)

            return updated;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error("Failed to accept request:", error);
        return NextResponse.json({ error: 'Failed to accept request' }, { status: 500 });
    }
}
