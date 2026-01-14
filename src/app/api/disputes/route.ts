import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const whereClause: any = {};
        if (session.role === 'CLIENT') {
            // Disputes opened by client OR on client's requests? 
            // Schema has `openedBy`. Let's allow users to see disputes they opened + disputes on their requests (if opened by expert/admin?)
            // Simplest: `openedBy` matches. Or `request.clientId` matches.
            // Let's assume disputes are tied to requests.
            whereClause.openedBy = session.id;
        } else if (session.role === 'EXPERT') {
            whereClause.openedBy = session.id; // Or request assigned to them?
            // Ideally expert sees disputes on their jobs.
            // whereClause.request = { assignedExpertId: session.id };
            // Prisma allows nesting in where.
            // let's stick to openedBy for now to be safe, or check request relation.
        } else if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
            // All
        }

        const disputes = await prisma.dispute.findMany({
            where: whereClause,
            include: {
                request: {
                    select: {
                        id: true,
                        service: { select: { nameEn: true, nameAr: true } } // Fetch service details
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const mapped = disputes.map(d => {
            const service = d.request?.service;
            return {
                ...d,
                serviceName: service ? (service.nameEn || service.nameAr) : 'Unknown'
            };
        });

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Dispute List Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { requestId, reason } = body;

        if (!requestId || !reason) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Create Dispute
        const dispute = await prisma.dispute.create({
            data: {
                requestId,
                openedBy: session.id,
                reason,
                status: 'OPEN'
            }
        });

        // Update Request Status
        await prisma.request.update({
            where: { id: requestId },
            data: { status: 'DISPUTED' }
        });

        return NextResponse.json(dispute);
    } catch (error) {
        console.error('Dispute Create Error', error);
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
        const { id, status, resolutionNotes } = body;

        if (!id || !status) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const dispute = await prisma.dispute.update({
            where: { id },
            data: {
                status,
                resolutionNotes
            }
        });

        return NextResponse.json(dispute);
    } catch (error) {
        console.error('Dispute Update Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
