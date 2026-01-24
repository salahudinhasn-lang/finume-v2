
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'finume-secret-key-change-me-in-prod';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // 1. Find User (Central Table)
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                clientProfile: { include: { permissions: true } },
                expertProfile: true,
                adminProfile: true
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Compare Password
        let isValid = false;
        try {
            isValid = await bcrypt.compare(password, user.passwordHash);
        } catch (e) {
            isValid = false;
        }

        // Fallback for seed data (plain text) CHECK
        if (!isValid && user.passwordHash === password) {
            console.warn(`User ${email} logged in with plain text password.`);
            isValid = true;
        }

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
        }

        // 3. Generate Token
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 4. Construct Response (Flatten for Frontend compatibility)
        const { passwordHash, clientProfile, expertProfile, adminProfile, ...baseUser } = user;

        let finalUser: any = { ...baseUser };

        if (user.role === 'CLIENT' && clientProfile) {
            finalUser = { ...finalUser, ...clientProfile, role: 'CLIENT' };
        } else if (user.role === 'EXPERT' && expertProfile) {
            finalUser = { ...finalUser, ...expertProfile, role: 'EXPERT' };
        } else if (user.role === 'ADMIN' && adminProfile) {
            finalUser = { ...finalUser, ...adminProfile, role: 'ADMIN' };
        }

        const response = NextResponse.json({
            user: finalUser,
            token
        });

        response.cookies.set({
            name: 'finume_token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
