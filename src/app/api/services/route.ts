
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET /api/services
export async function GET() {
    try {
        const services = await prisma.service.findMany({
            orderBy: { price: 'asc' }
        });
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}

// POST /api/services (Create or Update)
export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (body.id && !body.id.startsWith('S-NEW')) {
            // Update
            const service = await prisma.service.upsert({
                where: { id: body.id },
                update: {
                    nameEn: body.nameEn,
                    nameAr: body.nameAr || body.nameEn,
                    description: body.description,
                    price: parseFloat(body.price)
                },
                create: {
                    nameEn: body.nameEn,
                    nameAr: body.nameAr || body.nameEn,
                    description: body.description,
                    price: parseFloat(body.price)
                }
            });
            return NextResponse.json(service);
        } else {
            // Create
            const service = await prisma.service.create({
                data: {
                    nameEn: body.nameEn,
                    nameAr: body.nameAr || body.nameEn,
                    description: body.description,
                    price: parseFloat(body.price)
                }
            });
            return NextResponse.json(service);
        }
    } catch (error) {
        console.error('Service error:', error);
        return NextResponse.json({ error: 'Failed to save service' }, { status: 500 });
    }
}

// DELETE /api/services
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        await prisma.service.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
