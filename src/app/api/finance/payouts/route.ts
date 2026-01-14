import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { PayoutStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const whereClause: any = {};
        if (session.role === 'EXPERT') {
            whereClause.expertId = session.id; // Assuming session.id is UserId. ExpertProfile linked via userId.
            // Wait, schema: PayoutRequest.expertId references ExpertProfile.userId (which IS User ID). Correct.
        } else if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
            // Admin sees all
        } else {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const payouts = await prisma.payoutRequest.findMany({
            where: whereClause,
            include: {
                expert: {
                    include: { user: { select: { name: true, email: true } } }
                }
            },
            orderBy: { requestDate: 'desc' }
        });

        return NextResponse.json(payouts);
    } catch (error) {
        console.error('Payout List Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'EXPERT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // 1. Calculate Available Balance
        // Sum of all COMPLETED requests assigned to this expert that are NOT linked to a PayoutRequest
        const completedRequests = await prisma.request.findMany({
            where: {
                assignedExpertId: session.id,
                status: 'COMPLETED',
                payoutId: null
            },
            include: {
                service: { select: { basePrice: true } }
            }
        });

        if (completedRequests.length === 0) {
            return NextResponse.json({ error: 'No funds available for payout' }, { status: 400 });
        }

        // Calculate total amount (Expert Share = 80%)
        const totalAmount = completedRequests.reduce((acc, r: any) => {
            const price = Number(r.service?.basePrice) || 0;
            return acc + (price * 0.8);
        }, 0);

        if (totalAmount <= 0) {
            return NextResponse.json({ error: 'No funds available' }, { status: 400 });
        }

        // 2. Create Payout Request
        const payout = await prisma.payoutRequest.create({
            data: {
                expertId: session.id,
                amount: totalAmount,
                status: 'PENDING',
                // Connect requests
                requests: {
                    connect: completedRequests.map(r => ({ id: r.id }))
                }
            } as any
        });

        return NextResponse.json(payout);

    } catch (error) {
        console.error('Payout Create Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { id, status } = body; // Payout ID

        if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const payout = await prisma.payoutRequest.update({
            where: { id },
            data: {
                status: status as PayoutStatus,
                processedDate: status === 'PAID' ? new Date() : undefined
            }
        });

        return NextResponse.json(payout);
    } catch (error) {
        console.error('Payout Update Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
