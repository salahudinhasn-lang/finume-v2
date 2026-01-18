import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';



export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const users = await prisma.user.findMany({
            include: {
                clientProfile: { include: { permissions: true } },
                expertProfile: true,
                adminProfile: true
            }
        });

        const clients: any[] = [];
        const experts: any[] = [];
        const admins: any[] = [];

        for (const user of users) {
            const { passwordHash, clientProfile, expertProfile, adminProfile, ...baseUser } = user;

            if (user.role === 'CLIENT' && clientProfile) {
                clients.push({ ...baseUser, ...clientProfile, role: 'CLIENT' });
            } else if (user.role === 'EXPERT' && expertProfile) {
                // Prioritize Expert.name if exists, else User.name
                const mergedName = expertProfile.name || baseUser.name;

                // Convert Decimals to Numbers/Strings for JSON safety
                const safeExpert = {
                    ...expertProfile,
                    hourlyRate: expertProfile.hourlyRate ? Number(expertProfile.hourlyRate) : 0,
                    rating: expertProfile.rating ? Number(expertProfile.rating) : 0,
                    totalEarned: expertProfile.totalEarned ? Number(expertProfile.totalEarned) : 0,
                    totalReviews: expertProfile.totalReviews || 0 // Int but safe
                };

                experts.push({ ...baseUser, ...safeExpert, name: mergedName, role: 'EXPERT' });
            } else if (user.role === 'ADMIN' && adminProfile) {
                admins.push({ ...baseUser, ...adminProfile, role: 'ADMIN' });
            }
        }

        return NextResponse.json({
            clients,
            experts,
            admins
        });
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
