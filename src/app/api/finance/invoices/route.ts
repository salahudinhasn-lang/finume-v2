import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const whereClause: any = {};
        if (session.role === 'CLIENT') {
            // ClientProfile linked via userId. Invoice.clientId references ClientProfile.userId (User ID).
            whereClause.clientId = session.id;
        } else if (session.role === 'ADMIN' || session.role === 'SUPER_ADMIN') {
            // Admin sees all
        } else {
            // Experts don't usually see invoices sent to clients? Or maybe they do. Let's restrict to Client/Admin for now.
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const invoices = await prisma.invoice.findMany({
            where: whereClause,
            include: {
                request: {
                    select: {
                        service: { select: { nameEn: true, nameAr: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const mapped = invoices.map(inv => {
            const service = inv.request?.service;
            const name = service ? (service.nameEn || service.nameAr) : 'Service Request';
            return {
                ...inv,
                serviceName: name
            };
        });

        return NextResponse.json(mapped);
    } catch (error) {
        console.error('Invoice List Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
