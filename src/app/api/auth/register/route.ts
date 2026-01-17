
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

// Validation Schema
const RegisterSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(['CLIENT', 'EXPERT', 'ADMIN']).default('CLIENT'),
    companyName: z.string().optional(), // For Client
    industry: z.string().optional(),    // For Client
    mobileNumber: z.string().min(9),    // Required
    // Expert fields
    bio: z.string().optional(),
    yearsExperience: z.union([z.string(), z.number()]).optional(),
    hourlyRate: z.union([z.string(), z.number()]).optional(),
    specializations: z.array(z.string()).optional(),
    linkedinUrl: z.string().optional(),
});

// ... imports unchanged
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const result = RegisterSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
        }

        const { name, email, password, role, companyName, industry, mobileNumber, bio, yearsExperience, hourlyRate, specializations, linkedinUrl } = result.data;

        // 1. Check if user exists in User table
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
        }

        // 2. Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;

        // 3. Create User based on Role
        if (role === 'CLIENT') {
            // Generate Custom ID for Client (CUS-000001)
            const lastUser = await prisma.user.findFirst({
                where: { role: 'CLIENT', id: { startsWith: 'cus-' } },
                orderBy: { id: 'desc' },
                select: { id: true }
            });

            let nextSerial = 1;
            if (lastUser && lastUser.id) {
                const parts = lastUser.id.split('-');
                if (parts.length === 2 && !isNaN(Number(parts[1]))) {
                    nextSerial = Number(parts[1]) + 1;
                }
            }
            const userId = `cus-${nextSerial.toString().padStart(6, '0')}`;

            newUser = await prisma.user.create({
                data: {
                    id: userId,
                    name,
                    email,
                    passwordHash: hashedPassword,
                    role: 'CLIENT',
                    mobileNumber,
                    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
                    clientProfile: {
                        create: {
                            companyName: companyName || name, // Default to name if company name missing
                            industry: industry || 'General',
                            // Removed jobTitle to avoid lint error if input type is mismatching 
                            permissions: {
                                create: {
                                    canViewReports: true,
                                    canUploadDocs: true,
                                    canDownloadInvoices: true,
                                    canRequestCalls: true,
                                    canSubmitTickets: true,
                                    canViewMarketplace: true
                                }
                            }
                        }
                    }
                },
                include: { clientProfile: true }
            });
        } else if (role === 'EXPERT') {
            // Generate Custom ID for Expert (EXP-000001)
            const lastUser = await prisma.user.findFirst({
                where: { role: 'EXPERT', id: { startsWith: 'exp-' } },
                orderBy: { id: 'desc' },
                select: { id: true }
            });

            let nextSerial = 1;
            if (lastUser && lastUser.id) {
                const parts = lastUser.id.split('-');
                if (parts.length === 2 && !isNaN(Number(parts[1]))) {
                    nextSerial = Number(parts[1]) + 1;
                }
            }
            const userId = `exp-${nextSerial.toString().padStart(6, '0')}`;

            newUser = await prisma.user.create({
                data: {
                    id: userId,
                    name,
                    email,
                    passwordHash: hashedPassword,
                    role: 'EXPERT',
                    isActive: false, // Experts must be vetted
                    avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
                    expertProfile: {
                        create: {
                            bio,
                            yearsExperience: yearsExperience ? Number(yearsExperience) : undefined,
                            hourlyRate: hourlyRate ? Number(hourlyRate) : undefined,
                            specializations: specializations ? specializations : [], // Assumes schema handles string[] or Json
                            kycStatus: 'PENDING'
                        }
                    }
                },
                include: { expertProfile: true }
            });
        } else if (role === 'ADMIN') {
            const lastUser = await prisma.user.findFirst({
                where: { role: 'ADMIN', id: { startsWith: 'adm-' } },
                orderBy: { id: 'desc' },
                select: { id: true }
            });

            let nextSerial = 1;
            if (lastUser && lastUser.id) {
                const parts = lastUser.id.split('-');
                if (parts.length === 2 && !isNaN(Number(parts[1]))) {
                    nextSerial = Number(parts[1]) + 1;
                }
            }
            const userId = `adm-${nextSerial.toString().padStart(6, '0')}`;

            newUser = await prisma.user.create({
                data: {
                    id: userId,
                    name,
                    email,
                    passwordHash: hashedPassword,
                    role: 'ADMIN',
                    avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
                    adminProfile: {
                        create: {
                            adminLevel: 'OPS'
                        }
                    }
                },
                include: { adminProfile: true }
            });
        }

        if (!newUser) {
            return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }

        // 4. Generate Token
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 5. Return
        const { passwordHash: _, ...userWithoutPassword } = newUser;

        return NextResponse.json({
            user: userWithoutPassword,
            token
        }, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
