import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const userCount = await prisma.user.count();
        const users = await prisma.user.findMany({
            take: 10,
            select: {
                id: true,
                email: true,
                role: true,
                name: true,
                expertProfile: true
            }
        });

        const dbUrl = process.env.DATABASE_URL || 'NOT_SET';
        const maskedUrl = dbUrl === 'NOT_SET' ? 'NOT_SET' : dbUrl.replace(/:[^:]+@/, ':***@');

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            dbUrl: maskedUrl,
            userCount,
            users,
            env: process.env.NODE_ENV
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}
