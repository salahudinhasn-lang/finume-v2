
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// Validation Schema
const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['CLIENT', 'EXPERT']).default('CLIENT'),
    companyName: z.string().optional(), // For Client
    industry: z.string().optional(),    // For Client
});

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = RegisterSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
        }

        const { name, email, password, role, companyName, industry } = result.data;

        // 1. Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email }
        });

        if (existing) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create User
        // Note: Avatar generation is nice to keep
        const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${name}`;

        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                avatarUrl,
                companyName: role === 'CLIENT' ? companyName : undefined,
                industry: role === 'CLIENT' ? industry || 'General' : undefined,
                // Client Defaults
                totalSpent: 0,
                zatcaStatus: 'GREEN',
                // Create Default Permissions if Client
                permissions: role === 'CLIENT' ? {
                    create: {
                        canViewReports: true,
                        canUploadDocs: true,
                        canDownloadInvoices: true,
                        canRequestCalls: true,
                        canSubmitTickets: true,
                        canViewMarketplace: false
                    }
                } : undefined
            },
            include: { permissions: true }
        });

        // 4. Generate Token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Return
        const { password: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            user: userWithoutPassword,
            token
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
