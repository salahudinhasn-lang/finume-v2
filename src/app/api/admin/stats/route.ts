import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const _auth = await requireRole(request, ['ADMIN', 'SUPER_ADMIN']);
        if (_auth instanceof NextResponse) return _auth;
        const [totalExperts, activeExpertsCount, totalClients] = await Promise.all([
            prisma.expert.count(),
            prisma.expert.count({
                where: {
                    OR: [
                        { status: 'ACTIVE' },
                        { kycStatus: 'APPROVED' }
                    ]
                }
            }),
            prisma.client.count()
        ]);

        return NextResponse.json({
            totalExperts,
            activeExperts: activeExpertsCount,
            totalClients
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
