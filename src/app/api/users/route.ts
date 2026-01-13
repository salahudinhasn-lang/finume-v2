import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role');
    const status = searchParams.get('status'); // e.g., PENDING for experts

    try {
        const whereClause: any = {};
        if (role) whereClause.role = role.toUpperCase();

        // Filter by expert kyc status provided via profile relation logic
        // This is trickier with simple query, might need include.
        // Let's keep it simple: filter users.

        // If status requested is for experts (KYC)
        if (status === 'VETTING' || status === 'PENDING') {
            whereClause.role = 'EXPERT';
            whereClause.expertProfile = {
                kycStatus: 'PENDING'
            };
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            include: {
                clientProfile: true,
                expertProfile: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // Sanitize output (remove hash)
        const safeUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            isActive: u.isActive,
            createdAt: u.createdAt,
            profile: u.role === 'CLIENT' ? u.clientProfile : u.role === 'EXPERT' ? u.expertProfile : null
        }));

        return NextResponse.json(safeUsers);
    } catch (error) {
        console.error('User List Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
