
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // 1. Find User
        const user = await prisma.user.findUnique({
            where: { email },
            include: { permissions: true } // Include permissions if client
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Compare Password (backward compat with plain text '12121212' common in seeds)
        let isValid = false;

        // A. Try Bcrypt
        // If password doesn't look like a hash (e.g. is '12121212'), bcrypt.compare calls might error or fail gracefully.
        // It's safer to try compare.
        try {
            isValid = await bcrypt.compare(password, user.password);
        } catch (e) {
            isValid = false;
        }

        // B. Fallback to plain text (DEV ONLY - for seed compatibility)
        if (!isValid && user.password === password) {
            console.warn(`User ${email} logged in with PLAIN TEXT password. Please migrate to hash.`);
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

        // 4. Return User (clean) + Token
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            user: userWithoutPassword,
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
