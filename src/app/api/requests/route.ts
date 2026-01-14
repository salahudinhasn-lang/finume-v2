import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


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
        let { clientId, serviceId, pricingPlanId, amount, description, batches } = body;

        // Legacy/Frontend Cache Compatibility Layer
        // Map old 5-digit IDs (PLAN-00001) to new 4-digit IDs (PLAN-0001)
        if (pricingPlanId && pricingPlanId.startsWith('PLAN-0000')) {
            const planNum = pricingPlanId.replace('PLAN-0000', '');
            pricingPlanId = `PLAN-000${planNum}`; // e.g., PLAN-0001
        }
        else if (pricingPlanId && pricingPlanId.startsWith('Plan-')) {
            // Handle any old mixed case
            pricingPlanId = pricingPlanId.toUpperCase().replace('PLAN-', 'PLAN-000');
            // Attempt to standardise "Plan-0001" -> "PLAN-0001"
            if (pricingPlanId.length === 9) { // PLAN-0001
                // Correct
            }
        }

        // Ensure Client Exists
        const userExists = await prisma.user.findUnique({ where: { id: clientId } });
        if (!userExists) {
            await prisma.user.create({
                data: {
                    id: clientId,
                    email: `user-${clientId}@example.com`,
                    name: 'Client ' + clientId,
                    role: 'CLIENT',
                    passwordHash: 'placeholder-hash-for-stub-user',
                }
            });
        }

        // Validate Services or Plans
        if (serviceId) {
            const serviceExists = await prisma.service.findUnique({ where: { id: serviceId } });
            if (!serviceExists) {
                await prisma.service.create({
                    data: {
                        id: serviceId,
                        nameEn: 'Custom Service',
                        nameAr: 'خدمة مخصصة',
                        basePrice: amount,
                        slug: `custom-${serviceId}`,
                        type: 'ONE_TIME',
                        description: description || 'Custom Request'
                    }
                });
            }
        } else if (pricingPlanId) {
            const planExists = await prisma.pricingPlan.findUnique({ where: { id: pricingPlanId } });
            if (!planExists) {
                return NextResponse.json({ error: 'Invalid Pricing Plan ID', details: `Received ID: ${pricingPlanId}` }, { status: 400, headers: corsHeaders });
            }
        }


        // Validate simple required fields
        if (!clientId || (!serviceId && !pricingPlanId) || !amount) {
            return NextResponse.json({ error: 'Missing Required Fields (Service or Plan)' }, { status: 400, headers: corsHeaders });
        }
        // Deduplication Check
        // Check if a request with same clientId and same plan/service was created in the last 10 seconds
        const duplicateCheck = await prisma.request.findFirst({
            where: {
                clientId,
                OR: [
                    { pricingPlanId: pricingPlanId || undefined },
                    { serviceId: serviceId || undefined }
                ],
                createdAt: {
                    gte: new Date(Date.now() - 10 * 1000) // 10 seconds ago
                }
            }
        });

        if (duplicateCheck) {
            console.log('Duplicate request detected, returning existing one.');
            return NextResponse.json(duplicateCheck, { headers: corsHeaders });
        }

        // Generate Custom Sequential ID (REQ-000001)
        const lastRequest = await prisma.request.findFirst({
            where: { id: { startsWith: 'REQ-' } },
            orderBy: { id: 'desc' }
        });

        let nextId = 'REQ-000001';
        if (lastRequest) {
            const currentNum = parseInt(lastRequest.id.replace('REQ-', ''), 10);
            if (!isNaN(currentNum)) {
                nextId = `REQ-${String(currentNum + 1).padStart(6, '0')}`;
            }
        }

        const newRequest = await prisma.request.create({
            data: {
                id: nextId,
                clientId,
                serviceId,
                pricingPlanId,
                amount,
                description: description || '',
                status: body.status || 'PENDING_PAYMENT', // Use provided status or default to PENDING_PAYMENT
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
                service: true,
                pricingPlan: true,
                client: {
                    include: { user: true }
                },
                assignedExpert: {
                    include: { user: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}
