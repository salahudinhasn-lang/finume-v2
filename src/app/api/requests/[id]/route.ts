
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

        // Extract allowed fields to update
        const { assignedExpertId, status, visibility, requiredSkills } = body;

        const dataToUpdate: any = {};
        if (assignedExpertId !== undefined) dataToUpdate.assignedExpertId = assignedExpertId;
        if (status !== undefined) dataToUpdate.status = status;
        if (visibility !== undefined) dataToUpdate.visibility = visibility;
        if (requiredSkills !== undefined) dataToUpdate.requiredSkills = typeof requiredSkills === 'object' ? JSON.stringify(requiredSkills) : requiredSkills;

        const updatedRequest = await prisma.request.update({
            where: { id },
            data: dataToUpdate
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        console.error("Failed to update request:", error);
        return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.request.delete({
            where: { id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete request:", error);
        return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
    }
}
