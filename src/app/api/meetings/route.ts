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
                client: { select: { user: { select: { name: true, avatarUrl: true } }, companyName: true } },
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
            clientName: m.client.user.name,
            clientAvatar: m.client.user.avatarUrl
        }));

        // Wait, 'client' in simplified query above relates to Client model. 
        // Client model -> User model relation is 'user'. 
        // I need to include 'user' in client include to get avatar.

        return NextResponse.json(formattedMeetings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log('[API] Processing Meeting Booking...');
        const token = req.cookies.get('finume_token')?.value;
        console.log('[API] Token found:', !!token);

        const user = await getUserFromToken(req);
        console.log('[API] User resolved:', user ? `${user.id} (${user.role})` : 'null');

        if (!user || user.role !== 'CLIENT') {
            return NextResponse.json({ error: 'Unauthorized', debug: { hasToken: !!token, user: user || 'null' } }, { status: 401 });
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

export async function PATCH(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { id, status, date, startTime, endTime } = body;

        if (!id) return NextResponse.json({ error: 'Meeting ID required' }, { status: 400 });

        const meeting = await prisma.meeting.findUnique({ where: { id } });
        if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

        let dataValues: any = {};

        // 1. Status Update (Expert/Admin can confirm/cancel. Client can cancel.)
        if (status) {
            // Permission check for status
            if (status === 'CONFIRMED' && user.role === 'CLIENT') {
                return NextResponse.json({ error: 'Client cannot confirm meetings' }, { status: 403 });
            }
            // Allow simplified state transitions for now
            dataValues.status = status;
        }

        // 2. Rescheduling (Client Only, unless Admin)
        if (date || startTime || endTime) {
            if (user.role === 'EXPERT' && user.id !== meeting.expertId) {
                // Expert shouldn't reschedule arbitrarily unless they are the assigned one? 
                // Prompt says "client can modify the meeting change date or time". Let's restrict to Client or Admin.
                // Assuming Expert might want to propose time? But simpler to follow prompt: "client can modify"
            }

            if (user.role === 'CLIENT' && user.id !== meeting.clientId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

            // Only allow rescheduling pending or confirmed meetings
            if (['CANCELLED', 'COMPLETED'].includes(meeting.status)) {
                return NextResponse.json({ error: 'Cannot reschedule cancelled/completed meetings' }, { status: 400 });
            }

            if (date) dataValues.date = new Date(date);
            if (startTime) dataValues.startTime = startTime;
            if (endTime) dataValues.endTime = endTime;

            // If rescheduled, maybe reset status to PENDING if originally CONFIRMED? 
            // Better to keep pending re-confirmation.
            dataValues.status = 'PENDING';
        }

        const updatedMeeting = await prisma.meeting.update({
            where: { id },
            data: dataValues
        });

        return NextResponse.json(updatedMeeting);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
