
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'finume-secret-key-change-me-in-prod';

export async function POST(request: Request) {
    try {
        const { token, role: requestedRole } = await request.json();

        // Verify Google Token (Lightweight fetch)
        const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
        if (!googleRes.ok) {
            return NextResponse.json({ error: 'Invalid Google Token' }, { status: 401 });
        }

        const googleUser = await googleRes.json();
        const { email, sub: googleId, name, picture } = googleUser;

        if (!email) {
            return NextResponse.json({ error: 'Email not provided by Google' }, { status: 400 });
        }

        // Upsert User
        // 1. Check if user exists by email OR googleId
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { googleId }
                ]
            },
            include: {
                clientProfile: { include: { permissions: true } },
                expertProfile: true,
                adminProfile: true
            }
        });

        if (user) {
            // Update Google ID if missing
            if (!user.googleId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: { googleId, avatarUrl: user.avatarUrl || picture },
                    include: {
                        clientProfile: { include: { permissions: true } },
                        expertProfile: true,
                        adminProfile: true
                    }
                });
            }
        } else {
            // Create New User (Default to Client)
            // Generate a random password hash since they use Google
            const randomId = requestedRole === 'EXPERT'
                ? `EXP-${Math.floor(100000 + Math.random() * 900000)}`
                : `CUS-${Math.floor(100000 + Math.random() * 900000)}`;

            const newRole = requestedRole === 'EXPERT' ? 'EXPERT' : 'CLIENT';

            const userData: any = {
                id: randomId,
                email,
                name,
                googleId,
                avatarUrl: picture,
                role: newRole,
                passwordHash: 'GOOGLE_AUTH_NO_PASS',
                isActive: true,
                isVerified: true
            };

            if (newRole === 'CLIENT') {
                userData.clientProfile = {
                    create: {
                        companyName: 'New Company',
                        industry: 'General',
                    }
                };
            } else if (newRole === 'EXPERT') {
                userData.expertProfile = {
                    create: {
                        bio: 'New Expert via Google',
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

        // Generate App Token
        const jwtToken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Construct Response
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

    } catch (error: any) {
        console.error('Google Auth Error:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error',
            details: error.toString()
        }, { status: 500 });
    }
}
