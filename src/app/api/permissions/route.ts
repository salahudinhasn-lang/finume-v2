
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Update permissions for a specific client
export async function POST(request: Request) {
    try {
        const { clientId, permissions } = await request.json();

        if (!clientId || !permissions) {
            return NextResponse.json({ error: 'Missing clientId or permissions' }, { status: 400 });
        }

        const updated = await prisma.clientFeaturePermissions.upsert({
            where: { clientId },
            update: permissions,
            create: {
                clientId,
                ...permissions
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating permissions:', error);
        return NextResponse.json({ error: 'Failed to update permissions' }, { status: 500 });
    }
}
