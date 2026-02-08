import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Ensure correct path to prisma instance

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const clientId = url.searchParams.get('clientId');

        if (!clientId) {
            return NextResponse.json({ error: 'Client ID required' }, { status: 400 });
        }

        const invoices = await prisma.invoice.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
            include: {
                request: {
                    select: {
                        displayId: true,
                        service: { select: { nameEn: true, nameAr: true } },
                        pricingPlan: { select: { name: true } },
                        description: true,
                        amount: true // In case invoice amount differs or we want to show base
                    }
                }
            }
        });

        // Format for frontend
        const formattedInvoices = invoices.map(inv => ({
            id: inv.displayId || inv.id,
            rawId: inv.id,
            description: inv.request?.pricingPlan?.name || inv.request?.service?.nameEn || inv.request?.description || 'Service Request',
            date: inv.createdAt.toISOString().split('T')[0],
            amount: Number(inv.amount), // This includes VAT as stored
            vat: Number(inv.amount) - (Number(inv.amount) / 1.15), // Back-calculate VAT for display if needed
            status: inv.status,
            requestId: inv.request?.displayId,
            details: `Proof of payment for Request #${inv.request?.displayId || 'N/A'}`
        }));

        return NextResponse.json(formattedInvoices);
    } catch (error) {
        console.error("Failed to fetch invoices:", error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}
