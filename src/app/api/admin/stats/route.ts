import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
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
