import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const _auth = await requireUser(req);
        if (_auth instanceof NextResponse) return _auth;

        const url = new URL(req.url);
        const clientId = url.searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
        }
        if (_auth.role !== 'ADMIN' && _auth.id !== clientId) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
        });

    } catch (error) {
        console.error('Error fetching client financials:', error);
        return NextResponse.json({ error: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}
