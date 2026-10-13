import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

const NO_STORE_HEADERS = {
    'Cache-Control': 'no-store, max-age=0, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
};

// Public-safe expert profile for the marketplace: no emails, phones, documents or earnings.
function toPublicExpert(baseUser: any, expertProfile: any) {
    return {
        id: baseUser.id,
        name: expertProfile.name || baseUser.name || 'Unknown',
        role: 'EXPERT',
        avatarUrl: baseUser.avatarUrl,
        status: expertProfile.status || 'VETTING',
        specializations: expertProfile.specializations || [],
        bio: expertProfile.bio || '',
        yearsExperience: expertProfile.yearsExperience || 0,
        isPremium: !!expertProfile.isPremium,
        isFeatured: !!expertProfile.isFeatured,
        hourlyRate: Number(expertProfile.hourlyRate || 0),
        rating: Number(expertProfile.rating || 0),
        totalReviews: Number(expertProfile.totalReviews || 0),
        linkedinUrl: expertProfile.linkedinUrl || null,
        createdAt: baseUser.createdAt,
        updatedAt: baseUser.updatedAt
    };
}

// Public-safe client entry: company-level info only (no contacts / spend / KYC data).
function toPublicClient(baseUser: any, clientProfile: any, includePermissions: boolean) {
    const out: any = {
        id: baseUser.id,
        name: baseUser.name || clientProfile.companyName || 'Client',
        role: 'CLIENT',
        companyName: clientProfile.companyName || '',
        industry: clientProfile.industry || '',
        avatarUrl: baseUser.avatarUrl
    };
    if (includePermissions && clientProfile.permissions) out.permissions = clientProfile.permissions;
    return out;
}

export async function GET(request: Request) {
    try {
        const auth = await getAuthUser(request);
        const isAdmin = !!(auth && (auth.role === 'ADMIN' || auth.role === 'SUPER_ADMIN'));

        const users = await prisma.user.findMany({
            include: {
                clientProfile: { include: { permissions: true } },
                expertProfile: true,
                adminProfile: true
            }
        });

        if (!isAdmin) {
            // Directory subset for the public site and non-admin dashboards:
            // real counts + public expert profiles, without private fields.
            const experts: any[] = [];
            const clientsSlim: any[] = [];
            for (const user of users) {
                if (user.role === 'EXPERT' && user.expertProfile) {
                    experts.push(toPublicExpert(user, user.expertProfile));
                } else if (user.role === 'CLIENT' && user.clientProfile) {
                    clientsSlim.push(toPublicClient(user, user.clientProfile, !!(auth && auth.id === user.id)));
                }
            }
            return NextResponse.json({ clients: clientsSlim, experts: experts, admins: [] }, { headers: NO_STORE_HEADERS });
        }

        const clients: any[] = [];
        const experts: any[] = [];
        const admins: any[] = [];

        for (const user of users) {
            const { passwordHash, clientProfile, expertProfile, adminProfile, ...baseUser } = user;

            if (user.role === 'CLIENT' && clientProfile) {
                clients.push({ ...baseUser, ...clientProfile, role: 'CLIENT' });
            } else if (user.role === 'EXPERT' && expertProfile) {
                const flattenedExpert = {
                    id: baseUser.id,
                    email: baseUser.email,
                    name: expertProfile.name || baseUser.name || 'Unknown',
                    role: 'EXPERT',
                    mobileNumber: baseUser.mobileNumber || '',
                    avatarUrl: baseUser.avatarUrl,
                    status: expertProfile.status || 'VETTING',
                    specializations: expertProfile.specializations || [],
                    bio: expertProfile.bio || '',
                    yearsExperience: expertProfile.yearsExperience || 0,
                    isPremium: !!expertProfile.isPremium,
                    isFeatured: !!expertProfile.isFeatured,
                    hourlyRate: Number(expertProfile.hourlyRate || 0),
                    rating: Number(expertProfile.rating || 0),
                    totalEarned: Number(expertProfile.totalEarned || 0),
                    totalReviews: Number(expertProfile.totalReviews || 0),
                    createdAt: baseUser.createdAt,
                    updatedAt: baseUser.updatedAt,
                    documents: expertProfile.documents,
                    linkedinUrl: expertProfile.linkedinUrl,
                    cvUrl: expertProfile.cvUrl
                };
                experts.push(flattenedExpert);
            } else if (user.role === 'ADMIN' && adminProfile) {
                admins.push({ ...baseUser, ...adminProfile, role: 'ADMIN' });
            }
        }

        return NextResponse.json({ clients: clients, experts: experts, admins: admins }, { headers: NO_STORE_HEADERS });
    } catch (error: any) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: error.message || 'Unknown API Error', details: String(error) }, { status: 500 });
    }
}