import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, setSession } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, role, companyName, name } = body;

        // Basic Validation
        if (!email || !password || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check existing user
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);

        // Create User & Profile Transaction
        const user = await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash: hashedPassword,
                    role: role as Role,
                },
            });

            // Create specific profile based on role
            if (role === 'CLIENT') {
                await tx.clientProfile.create({
                    data: {
                        userId: newUser.id,
                        companyName: companyName || 'Unknown Company',
                        // Default props
                    },
                });
            } else if (role === 'EXPERT') {
                await tx.expertProfile.create({
                    data: {
                        userId: newUser.id,
                        bio: 'New Expert',
                        // Default props
                    },
                });
            }
            // Add Admin logic if needed, but Admin registration is restricted usually

            return newUser;
        });

        // Generate Session
        const token = await signToken({ id: user.id, email: user.email, role: user.role });
        await setSession(token);

        return NextResponse.json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role },
            token // Return token for client storage if needed (though cookie is set)
        });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
