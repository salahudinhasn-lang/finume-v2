
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';


// GET /api/plans
export async function GET() {
    try {
        const plans = await prisma.pricingPlan.findMany({
            orderBy: { price: 'asc' }
        });
        return NextResponse.json(plans);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch plans' }, { status: 500 });
    }
}

// POST /api/plans (Create or Update)
export async function POST(request: Request) {
    try {
        const body = await request.json();

        // If ID exists, update. Else create.
        if (body.id && !body.id.startsWith('PLAN-NEW')) {
            const plan = await prisma.pricingPlan.upsert({
                where: { id: body.id },
                update: {
                    name: body.name,
                    price: parseFloat(body.price),
                    description: body.description,
                    tagline: body.tagline,
                    features: JSON.stringify(body.features || []), // Ensure array
                    // attributes: JSON.stringify(body.attributes || {}), // Removed as not in schema
                    guarantee: body.guarantee,
                    isPopular: body.isPopular || false,
                    color: body.color,
                    expertShareType: body.expertShareType || 'PERCENTAGE',
                    expertShareValue: parseFloat(body.expertShareValue || 0)
                },
                create: {
                    id: body.id || body.name.toLowerCase().replace(/\s+/g, '-'), // Ensure ID exists
                    name: body.name,
                    price: parseFloat(body.price),
                    description: body.description,
                    tagline: body.tagline,
                    features: JSON.stringify(body.features || []),
                    // attributes: JSON.stringify(body.attributes || {}), // Removed as not in schema
                    guarantee: body.guarantee,
                    isPopular: body.isPopular || false,
                    color: body.color,
                    expertShareType: body.expertShareType || 'PERCENTAGE',
                    expertShareValue: parseFloat(body.expertShareValue || 0)
                }
            });
            return NextResponse.json(plan);
        } else {
            // Create new
            const plan = await prisma.pricingPlan.create({
                data: {
                    id: body.id || body.name.toLowerCase().replace(/\s+/g, '-'), // Ensure ID exists
                    name: body.name,
                    price: parseFloat(body.price),
                    description: body.description,
                    tagline: body.tagline,
                    features: JSON.stringify(body.features || []),
                    // attributes: JSON.stringify(body.attributes || {}), // Removed as not in schema
                    guarantee: body.guarantee,
                    isPopular: body.isPopular || false,
                    color: body.color,
                    expertShareType: body.expertShareType || 'PERCENTAGE',
                    expertShareValue: parseFloat(body.expertShareValue || 0)
                }
            });
            return NextResponse.json(plan);
        }

    } catch (error) {
        console.error('Plan error:', error);
        return NextResponse.json({ error: 'Failed to save plan' }, { status: 500 });
    }
}
