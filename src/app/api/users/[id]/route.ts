
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Prevent updating sensitive fields if necessary, but for Admin use it's fine.
        // We might want to remove 'id' or 'email' if those shouldn't change, 
        // but let's just pass body for now as it's partial.
        const { id: _id, emails, ...updates } = body; // Strip ID to be safe

        const updatedUser = await prisma.user.update({
            where: { id },
            data: updates
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("Failed to update user:", error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.user.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete user:", error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
