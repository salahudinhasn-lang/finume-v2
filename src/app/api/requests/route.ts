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
        if (pricingPlanId && pricingPlanId.startsWith('PLAN-0000')) {
            const planNum = pricingPlanId.replace('PLAN-0000', '');
            pricingPlanId = `PLAN-000${planNum}`; // e.g., PLAN-0001
        }
        else if (pricingPlanId && pricingPlanId.startsWith('Plan-')) {
            pricingPlanId = pricingPlanId.toUpperCase().replace('PLAN-', 'PLAN-000');
            if (pricingPlanId.length === 9) { // PLAN-0001
            }
        }

        // Ensure Client Exists
        const clientExists = await prisma.client.findUnique({ where: { id: clientId } });

        // If client doesn't exist, we should probably error out rather than auto-create in a requests endpoint
        if (!clientExists) {
            return NextResponse.json({ error: 'Client not found' }, { status: 404, headers: corsHeaders });
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

        // Generate Custom Sequential DISPLAY ID with Retry Logic
        let newRequest;
        let attempts = 0;
        const maxAttempts = 5;

        while (!newRequest && attempts < maxAttempts) {
            attempts++;
            try {
                const lastRequest = await prisma.request.findFirst({
                    where: { displayId: { startsWith: 'REQ-' } }, // Check displayId
                    orderBy: { displayId: 'desc' } // Order by displayId
                });

                let nextDisplayId = 'REQ-000001';
                if (lastRequest && lastRequest.displayId) {
                    const currentNum = parseInt(lastRequest.displayId.replace('REQ-', ''), 10);
                    if (!isNaN(currentNum)) {
                        // Optimistically increment. If concurrent requests happened, lastRequest might be stale, 
                        // but PRISMA unique constraint will fail, catching us below.
                        // We add attempts to the number to reduce collision probability in retry
                        const increment = attempts > 1 ? attempts : 1;
                        // Actually, just strictly +1 based on DB state is safer, rely on "findFirst" picking up the *new* latest.
                        nextDisplayId = `REQ-${String(currentNum + 1).padStart(6, '0')}`;
                    }
                }

                // Create Request
                newRequest = await prisma.request.create({
                    data: {
                        displayId: nextDisplayId,
                        clientId,
                        serviceId,
                        pricingPlanId,
                        amount,
                        description: description || '',
                        status: body.status || 'PENDING_PAYMENT',
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
            } catch (createError: any) {
                // Check for Unique Constraint Violation on displayId
                if (createError.code === 'P2002' && createError.meta?.target?.includes('displayId')) {
                    console.warn(`[REQ_CREATE] Display ID collision. Retrying... (Attempt ${attempts})`);
                    continue; // Loop again
                }
                throw createError; // Rethrow other errors
            }
        }

        if (!newRequest) {
            throw new Error(`Failed to generate unique Display ID after ${maxAttempts} attempts.`);
        }

        // --- INVOICE GENERATION LOGIC ---
        // If status is NEW, it means payment was successful (or manual creation as paid).
        if (newRequest.status === 'NEW') {
            try {
                // Determine invoice amount (inclusive of 15% VAT)
                // Request Amount is typically Base Price.
                const subtotal = Number(amount);
                const vat = subtotal * 0.15;
                const totalAmount = subtotal + vat;

                // Create Invoice
                const invoice = await prisma.invoice.create({
                    data: {
                        clientId,
                        requestId: newRequest.id, // Use the real DB ID
                        amount: totalAmount,
                        status: 'PAID',
                        // seqId auto-increments
                    }
                });

                // Update Display ID (INV-00000001)
                const invDisplayId = `INV-${String((invoice as any).seqId).padStart(8, '0')}`;
                await prisma.invoice.update({
                    where: { id: invoice.id },
                    data: { displayId: invDisplayId }
                });

                console.log(`[REQ_CREATE] Generated Invoice ${invDisplayId} for Request ${newRequest.displayId}`);

                // Update Request with Invoice Display ID
                await prisma.request.update({
                    where: { id: newRequest.id },
                    data: { invoiceDisplayId: invDisplayId }
                });

            } catch (invError) {
                console.error("[REQ_CREATE] Failed to generate invoice:", invError);
                // Do not fail the request creation, but log critical error
            }
        }

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

        // Placeholder to allow tool to run. I will not actually replace content here until I verify Schema strategy.
        // I will actually just include `poolInvites` in GET for now as that IS in schema.
        const requests = await prisma.request.findMany({
            where,
            include: {
                files: { orderBy: { createdAt: 'desc' } }, // Directly attached files
                batches: { include: { files: true } },
                transactions: true,
                service: true,
                pricingPlan: true,
                client: {
                    include: {
                        user: true
                    }
                },
                assignedExpert: true,
                poolInvites: true, // Include pool invites so frontend can see them
                review: true, // Include review data for Admin & Expert visibility
                invoices: true // Include invoices for Financials
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(requests, { headers: corsHeaders });
    } catch (error) {
        console.error('Error fetching requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders });
    }
}
