
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const users = await prisma.user.findMany({
            include: { permissions: true }
        });

        // Split by role for frontend convenience, matches AppContext expectation
        const clients = users.filter(u => u.role === 'CLIENT');
        const experts = users.filter(u => u.role === 'EXPERT');
        const admins = users.filter(u => u.role === 'ADMIN');

        // Remove passwords
        const cleanUsers = (list: any[]) => list.map(({ password, ...rest }) => rest);

        return NextResponse.json({
            clients: cleanUsers(clients),
            experts: cleanUsers(experts),
            admins: cleanUsers(admins)
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
