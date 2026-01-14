import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: session.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Notification List Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { id } = body;

        // Mark as read
        const notification = await prisma.notification.update({
            where: { id, userId: session.id },
            data: { readAt: new Date() }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Notification Update Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
