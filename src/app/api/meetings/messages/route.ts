import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getUserFromToken } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
    try {
        const user = await getUserFromToken(req);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { meetingId, content } = body;

        if (!meetingId || !content) {
            return NextResponse.json({ error: 'Missing meetingId or content' }, { status: 400 });
        }

        // Verify participation
        const meeting = await prisma.meeting.findUnique({
            where: { id: meetingId }
        });

        if (!meeting) return NextResponse.json({ error: 'Meeting not found' }, { status: 404 });

        // Check if user is participant or admin
        const isParticipant = meeting.clientId === user.id || meeting.expertId === user.id || user.role === 'ADMIN';
        if (!isParticipant) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const message = await prisma.meetingMessage.create({
            data: {
                meetingId,
                senderId: user.id,
                content
            }
        });

        return NextResponse.json(message);

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
