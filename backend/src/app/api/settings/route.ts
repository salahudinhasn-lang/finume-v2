
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        let settings = await prisma.platformSettings.findUnique({
            where: { id: 'global' }
        });

        if (!settings) {
            settings = await prisma.platformSettings.create({
                data: {
                    id: 'global',
                    showExpertsPage: false,
                    showServicesPage: false
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const settings = await prisma.platformSettings.upsert({
            where: { id: 'global' },
            update: body,
            create: {
                id: 'global',
                ...body
            }
        });
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
