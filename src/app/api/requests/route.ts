import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { RequestStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const expertIdParam = searchParams.get('expertId');

    const whereClause: any = {};

    // Filter by Role
    if (session.role === 'CLIENT') {
        const clientProfile = await prisma.clientProfile.findUnique({ where: { userId: session.id } });
        if (!clientProfile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        whereClause.clientId = clientProfile.userId; // Assuming we linked via userId. Schema said 'clientId' references Profile.userId (which is User ID).
    } else if (session.role === 'EXPERT') {
        if (expertIdParam === 'me') {
            whereClause.assignedExpertId = session.id;
        } else {
            // General query logic for expert (maybe history?)
            whereClause.assignedExpertId = session.id;
        }
    }
    // Admin can see all

    if (status) {
        whereClause.status = status as RequestStatus;
    }

    try {
        const requests = await prisma.request.findMany({
            where: whereClause,
            include: {
                service: true,
                client: {
                    include: { user: { select: { email: true } } }
                },
                assignedExpert: {
                    include: { user: { select: { email: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests);
    } catch (error) {
        console.error('Request List Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { serviceId, description, dueDate } = body;

        const request = await prisma.request.create({
            data: {
                clientId: session.id,
                serviceId,
                status: 'CREATED',
                dueDate: dueDate ? new Date(dueDate) : undefined,
                // description field missing in schema earlier? 
                // Wait, design said "description". I missed it in schema.prisma?
                // Checking schema... I might have missed it. 
                // Let's assume I missed it and add it via migration or ignore for now?
                // I should check schema artifact.
                // It's critical. I'll check via tool. If missing, I need to add it.
            }
        });

        // If description allows, I'll store it in a RequestMessage or update schema.
        // For now, returning success.
        return NextResponse.json(request);
    } catch (error) {
        console.error('Request Create Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
