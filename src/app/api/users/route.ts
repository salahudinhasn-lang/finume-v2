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
                // Explicitly construct the Expert object to ensure no field shadowing or missing data
                const flattenedExpert = {
                    id: baseUser.id,
                    email: baseUser.email,
                    name: expertProfile.name || baseUser.name || 'Unknown',
                    role: 'EXPERT',
                    mobileNumber: baseUser.mobileNumber || '',
                    avatarUrl: baseUser.avatarUrl,

                    // Expert Specific Fields
                    status: expertProfile.status || 'VETTING',
                    specializations: expertProfile.specializations || [],
                    bio: expertProfile.bio || '',
                    yearsExperience: expertProfile.yearsExperience || 0,
                    isPremium: !!expertProfile.isPremium,
                    isFeatured: !!expertProfile.isFeatured,

                    // Numeric Conversions
                    hourlyRate: Number(expertProfile.hourlyRate || 0),
                    rating: Number(expertProfile.rating || 0),
                    totalEarned: Number(expertProfile.totalEarned || 0),
                    totalReviews: Number(expertProfile.totalReviews || 0),

                    // Include timestamps for debugging
                    createdAt: baseUser.createdAt,
                    updatedAt: baseUser.updatedAt,

                    // Documents
                    documents: expertProfile.documents,
                    linkedinUrl: expertProfile.linkedinUrl,
                    cvUrl: expertProfile.cvUrl
                };

                experts.push(flattenedExpert);
            } else if (user.role === 'ADMIN' && adminProfile) {
                admins.push({ ...baseUser, ...adminProfile, role: 'ADMIN' });
            }
        }

        return NextResponse.json({
            clients,
            experts,
            admins
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
    } catch (error: any) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({
            error: error.message || 'Unknown API Error',
            details: String(error)
        }, { status: 500 });
    }
}
