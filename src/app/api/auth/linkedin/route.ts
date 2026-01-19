
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';
const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID || '77nmudsqcg5t0i';
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
// NOTE: Verify the redirect URI matches exactly what you configured in LinkedIn Developer Portal
const REDIRECT_URI = typeof window !== 'undefined'
    ? `${window.location.origin}/login`
    : 'https://finume-v2-f6b817a0a-finumes-projects.vercel.app/login'; // Hardcoded based on request for now, or dynamic

export async function POST(request: Request) {
    try {
        const { code, redirectUri, role: requestedRole } = await request.json();

        if (!LINKEDIN_CLIENT_SECRET) {
            throw new Error('LINKEDIN_CLIENT_SECRET is not defined');
        }

        // 1. Exchange Code for Token
        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: redirectUri,
                client_id: LINKEDIN_CLIENT_ID,
                client_secret: LINKEDIN_CLIENT_SECRET
            })
        });

        if (!tokenRes.ok) {
            const errorText = await tokenRes.text();
            console.error('LinkedIn Token Error:', errorText);
            return NextResponse.json({ error: 'Failed to exchange LinkedIn code' }, { status: 401 });
        }

        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;

        // 2. Fetch User Info (OpenID Connect)
        const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!userRes.ok) {
            return NextResponse.json({ error: 'Failed to fetch LinkedIn profile' }, { status: 401 });
        }

        const linkedInUser = await userRes.json();
        // LinkedIn OIDC structure: sub (id), name, email, picture
        const { sub: linkedinId, name, email, picture } = linkedInUser;

        if (!email) {
            return NextResponse.json({ error: 'Email not provided by LinkedIn' }, { status: 400 });
        }

        // 3. Upsert User
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { linkedinId }
                ]
            },
            include: {
                clientProfile: { include: { permissions: true } },
                expertProfile: true,
                adminProfile: true
            }
        });

        if (user) {
            if (!user.linkedinId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { linkedinId, avatarUrl: user.avatarUrl || picture },
                    include: {
                        clientProfile: { include: { permissions: true } },
                        expertProfile: true,
                        adminProfile: true
                    }
                });
            }
        } else {
            // Create New User
            const randomId = requestedRole === 'EXPERT'
                ? `EXP-${Math.floor(100000 + Math.random() * 900000)}`
                : `CUS-${Math.floor(100000 + Math.random() * 900000)}`;

            const newRole = requestedRole === 'EXPERT' ? 'EXPERT' : 'CLIENT';

            const userData: any = {
                id: randomId,
                email,
                name,
                linkedinId,
                avatarUrl: picture,
                role: newRole,
                passwordHash: 'LINKEDIN_AUTH_NO_PASS',
                isActive: true,
                isVerified: true
            };

            if (newRole === 'CLIENT') {
                userData.clientProfile = {
                    create: {
                        companyName: 'New Company',
                        industry: 'General'
                    }
                };
            } else if (newRole === 'EXPERT') {
                userData.expertProfile = {
                    create: {
                        bio: 'New Expert via LinkedIn',
                        specializations: ['General'],
                        status: 'VETTING'
                    }
                };
            }

            user = await prisma.user.create({
                data: userData,
                include: {
                    clientProfile: { include: { permissions: true } },
                    expertProfile: true,
                    adminProfile: true
                }
            });
        }

        // 4. Generate App Token
        const jwtToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Response
        const { passwordHash, clientProfile, expertProfile, adminProfile, ...baseUser } = user;
        let finalUser: any = { ...baseUser };

        if (user.role === 'CLIENT' && clientProfile) {
            finalUser = { ...finalUser, ...clientProfile, role: 'CLIENT' };
        } else if (user.role === 'EXPERT' && expertProfile) {
            finalUser = { ...finalUser, ...expertProfile, role: 'EXPERT' };
        } else if (user.role === 'ADMIN' && adminProfile) {
            finalUser = { ...finalUser, ...adminProfile, role: 'ADMIN' };
        }

        return NextResponse.json({
            user: finalUser,
            token: jwtToken
        });

    } catch (error) {
        console.error('LinkedIn Auth Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
