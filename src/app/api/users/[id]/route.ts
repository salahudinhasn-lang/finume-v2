
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// PATCH /api/users/[id]
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = params.id;
        const body = await request.json();
        const {
            password,
            // Expert Fields
            bio, hourlyRate, specializations, iban, kycStatus,
            // Client Fields
            companyName, vatNumber, industry, billingAddress,
            // User Fields
            ...userFields
        } = body;

        const dataToUpdate: any = { ...userFields };

        // If password is provided, hash it
        if (password) {
            if (password.length < 6) {
                return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            dataToUpdate.passwordHash = hashedPassword; // Schema uses passwordHash, not password
        }

        // Prepare Expert Profile Update
        const expertUpdates: any = {};
        if (bio !== undefined) expertUpdates.bio = bio;
        if (hourlyRate !== undefined) expertUpdates.hourlyRate = hourlyRate;
        if (specializations !== undefined) expertUpdates.specializations = specializations;
        if (iban !== undefined) expertUpdates.iban = iban;

        if (Object.keys(expertUpdates).length > 0) {
            dataToUpdate.expertProfile = {
                upsert: {
                    create: expertUpdates,
                    update: expertUpdates
                }
            };
        }

        // Prepare Client Profile Update
        const clientUpdates: any = {};
        if (companyName !== undefined) clientUpdates.companyName = companyName;
        if (vatNumber !== undefined) clientUpdates.vatNumber = vatNumber;
        if (industry !== undefined) clientUpdates.industry = industry;
        if (billingAddress !== undefined) clientUpdates.billingAddress = billingAddress;

        if (Object.keys(clientUpdates).length > 0) {
            dataToUpdate.clientProfile = {
                upsert: {
                    create: clientUpdates,
                    update: clientUpdates
                }
            };
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: dataToUpdate,
            include: { expertProfile: true, clientProfile: true }
        });

        // Remove password hash from response
        const { passwordHash: _, ...userWithoutPassword } = updatedUser;

        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        console.error('Failed to update user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// GET /api/users/[id] (Optional, useful for fetching fresh data)
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    try {
        const id = params.id;
        const user = await prisma.user.findUnique({
            where: { id },
            include: { permissions: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}
