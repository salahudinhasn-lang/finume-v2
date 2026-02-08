import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
    return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const clientId = url.searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID is required' }, { status: 400, headers: corsHeaders });
        }

        // Calculate total spend
        // User requested: "include vat for all the requests even if the requests not completed just include all the payment"
        // Interpretation: Any request that is past the payment stage.
        // Statuses NOT to count: PENDING_PAYMENT (not paid yet), CANCELLED (refunded/voided)
        // Statuses TO count: NEW, PENDING_ASSIGNMENT, MATCHED, IN_PROGRESS, REVIEW_CLIENT, REVIEW_ADMIN, COMPLETED, DISPUTED (usually paid), etc.
        const aggregations = await prisma.request.aggregate({
            _sum: {
                amount: true
            },
            where: {
                clientId: clientId,
                status: {
                    notIn: ['PENDING_PAYMENT', 'CANCELLED']
                }
            }
        });

        // Apply 15% VAT
        const rawTotal = aggregations._sum.amount ? Number(aggregations._sum.amount) : 0;
        const totalSpend = rawTotal * 1.15;

        return NextResponse.json({
            totalSpend,
            currency: 'SAR'
        }, { headers: corsHeaders });

    } catch (error) {
        console.error('Error fetching client financials:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500, headers: corsHeaders });
    }
}
