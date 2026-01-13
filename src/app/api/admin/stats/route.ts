import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const [
            totalClients,
            totalExperts,
            pendingExperts,
            totalRequests,
            totalRevenue
        ] = await Promise.all([
            prisma.user.count({ where: { role: 'CLIENT' } }),
            prisma.user.count({ where: { role: 'EXPERT' } }),
            prisma.expertProfile.count({ where: { kycStatus: 'PENDING' } }),
            prisma.request.count(),
            prisma.invoice.aggregate({
                where: { status: 'PAID' },
                _sum: { amount: true }
            })
        ]);

        const stats = {
            clients: totalClients,
            experts: totalExperts,
            pendingApprovals: pendingExperts,
            activeRequests: totalRequests, // Simplify for now
            revenue: totalRevenue._sum.amount ? Number(totalRevenue._sum.amount) : 0
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Admin Stats Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
