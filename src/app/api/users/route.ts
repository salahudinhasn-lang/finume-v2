import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


export async function GET(request: Request) {
    try {
        const users = await prisma.user.findMany({
            include: {
                clientProfile: {
                    include: { permissions: true }
                },
                expertProfile: true
            }
        });

        // Helper to clean user object
        const cleanUser = (u: any) => {
            const { passwordHash, ...rest } = u;
            return {
                ...rest,
                permissions: u.clientProfile?.permissions || null
            };
        };

        // Split by role for frontend convenience, matches AppContext expectation
        const clients = users.filter(u => u.role === 'CLIENT').map(cleanUser);
        const experts = users.filter(u => u.role === 'EXPERT').map(cleanUser);
        const admins = users.filter(u => u.role === 'ADMIN').map(cleanUser);

        return NextResponse.json({
            clients,
            experts,
            admins
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
