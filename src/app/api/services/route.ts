import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { ServiceType } from '@prisma/client';

// GET: List all services (Public or Admin filtered)
export async function GET(req: NextRequest) {
    try {
        const services = await prisma.service.findMany({
            where: { isActive: true }, // Default to active only for general listing
            orderBy: { nameEn: 'asc' }
        });
        return NextResponse.json(services);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Create new service (Admin Only)
export async function POST(req: NextRequest) {
    const session = await getSession();
    if (!session || !['ADMIN', 'SUPER_ADMIN'].includes(session.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { nameEn, nameAr, slug, type, basePrice } = body;

        const service = await prisma.service.create({
            data: {
                nameEn,
                nameAr,
                slug,
                type: type as ServiceType,
                basePrice: Number(basePrice)
            }
        });

        return NextResponse.json(service);
    } catch (error: any) {
        // Handle unique constraint error
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Service slug must be unique' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
