
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { clientId, serviceId, amount, description, batches } = body;

        // Ensure Client Exists (Mock Seed Check)
        // Check if user exists, if not create placeholder to satisfy FK
        const userExists = await prisma.user.findUnique({ where: { id: clientId } });
        if (!userExists) {
            // For simplicity in this demo, create the user if missing, assuming clientId is valid format
            // But usually clientId is 'C-1' or UUID.
            // We can just upsert.
            // Using ID as email placeholder if real email not known.
            await prisma.user.create({
                data: {
                    id: clientId,
                    email: `user-${clientId}@example.com`,
                    name: 'Client ' + clientId,
                    role: 'CLIENT',
                }
            });
        }

        // Ensure Service Exists
        const serviceExists = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!serviceExists) {
            // Upsert placeholder service
            await prisma.service.create({
                data: {
                    id: serviceId,
                    nameEn: 'Custom Service',
                    nameAr: 'خدمة مخصصة',
                    price: amount,
                    description: description || 'Custom Request'
                }
            });
        }


        // Validate simple required fields
        if (!clientId || !serviceId || !amount) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400, headers: corsHeaders });
        }

        // Generate Custom Sequential ID (REQ-0000000001)
        // 1. Find last request with REQ- prefix
        const lastRequest = await prisma.request.findFirst({
            where: { id: { startsWith: 'REQ-' } },
            orderBy: { id: 'desc' } // String sort works for fixed length padding
        });

        let nextId = 'REQ-0000000001';
        if (lastRequest) {
            const currentNum = parseInt(lastRequest.id.replace('REQ-', ''), 10);
            if (!isNaN(currentNum)) {
                nextId = `REQ-${String(currentNum + 1).padStart(10, '0')}`;
            }
        }

        const newRequest = await prisma.request.create({
            data: {
                id: nextId,
                clientId,
                serviceId,
                amount,
                description: description || '',
                status: 'NEW', // Initial status
                batches: {
                    create: batches ? batches.map((b: any) => ({
                        status: b.status,
                        files: {
                            create: b.files.map((f: any) => ({
                                name: f.name,
                                size: f.size,
                                type: f.type,
                                url: f.url,
                                uploadedById: clientId
                            }))
                        }
                    })) : []
                }
            },
            include: {
                batches: {
                    include: { files: true }
                }
            }
        });

        return NextResponse.json(newRequest, { headers: corsHeaders });
    } catch (error) {
        console.error('Error creating request:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500, headers: corsHeaders });
    }
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const clientId = url.searchParams.get('clientId');

        const where: any = {};
        if (clientId) {
            where.clientId = clientId;
        }

        const requests = await prisma.request.findMany({
            where,
            include: {
                batches: { include: { files: true } },
                transactions: true,
                service: true
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}
