
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// GET: Fetch tasks for the logged-in expert
export async function GET(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Check cookie as fallback
            const cookie = req.cookies.get('finume_token');
            if (!cookie) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader ? authHeader.split(' ')[1] : req.cookies.get('finume_token')?.value;
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let decodedToken: any;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const userId = decodedToken.userId || decodedToken.id;

        // Fetch tasks
        const tasks = await prisma.expertTask.findMany({
            where: { expertId: userId },
            include: {
                request: {
                    include: {
                        client: { include: { user: true } },
                        files: true // Include attached files
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map for frontend
        const mappedTasks = tasks.map(t => ({
            ...t,
            createdAt: t.createdAt.toISOString(),
            completedAt: t.completedAt?.toISOString()
        }));

        return NextResponse.json(mappedTasks);

    } catch (error) {
        console.error("Error fetching expert tasks:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PATCH: Update task status
export async function PATCH(req: NextRequest) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.split(' ')[1];
        let decodedToken: any;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const body = await req.json();
        const { taskId, status } = body;

        if (!taskId || !status) {
            return NextResponse.json({ error: 'Missing taskId or status' }, { status: 400 });
        }

        const task = await prisma.expertTask.update({
            where: { id: taskId },
            data: {
                status: status,
                completedAt: status === 'COMPLETED' ? new Date() : null
            }
        });

        return NextResponse.json(task);

    } catch (error) {
        console.error("Error updating expert task:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
