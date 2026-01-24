import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getUserFromToken } from '../../../lib/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const searchParams = req.nextUrl.searchParams;
        const role = searchParams.get('role'); // CLIENT or EXPERT context

        let whereClause: any = {};

        if (user.role === 'CLIENT' || role === 'CLIENT') {
            whereClause.clientId = user.id;
        } else if (user.role === 'EXPERT' || role === 'EXPERT') {
            whereClause.expertId = user.id;
        } else if (user.role === 'ADMIN') {
            // Admin can see all? or filter by param
        }

        const meetings = await prisma.meeting.findMany({
            where: whereClause,
            include: {
                client: { select: { name: true, avatarUrl: true, companyName: true } },
                expert: { select: { user: { select: { name: true, avatarUrl: true } } } },
                request: { select: { serviceId: true, displayId: true } },
                messages: { orderBy: { createdAt: 'asc' } }
            },
            orderBy: { date: 'asc' }
        });

        // Flatten expert name structure for easier frontend consumption
        const formattedMeetings = meetings.map(m => ({
            ...m,
            expertName: m.expert.user.name,
            expertAvatar: m.expert.user.avatarUrl,
            clientName: m.client.name,
            clientAvatar: m.client.user?.avatarUrl // Need to fetch user from client? Client model has relation to User
        }));

        // Wait, 'client' in simplified query above relates to Client model. 
        // Client model -> User model relation is 'user'. 
        // I need to include 'user' in client include to get avatar.

        return NextResponse.json(meetings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user || user.role !== 'CLIENT') {
            // Only clients book meetings? Prompt says "client click on book meeting".
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { requestId, expertId, date, startTime, endTime, notes } = body;

        if (!requestId || !expertId || !date || !startTime || !endTime) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate expert assignment to request? 
        // "choose Request Number... and choose the assigned Expert with that request"
        // It implies the expert MUST be assigned.
        const request = await prisma.request.findUnique({
            where: { id: requestId },
            select: { assignedExpertId: true }
        });

        if (!request || request.assignedExpertId !== expertId) {
            return NextResponse.json({ error: 'Invalid Request or Expert mismatch' }, { status: 400 });
        }

        const meeting = await prisma.meeting.create({
            data: {
                clientId: user.id,
                expertId,
                requestId,
                date: new Date(date), // Ensure correct format
                startTime,
                endTime,
                notes,
                status: 'PENDING',
                messages: notes ? {
                    create: {
                        senderId: user.id,
                        content: notes
                    }
                } : undefined
            }
        });

        return NextResponse.json(meeting);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
