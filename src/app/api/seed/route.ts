
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Simple Seed Logic
        // 1. Services
        const services = [
            { id: 'S-1', nameEn: 'VAT Return Filing', nameAr: 'تقديم إقرار ضريبة القيمة المضافة', price: 500, description: 'Quarterly VAT filing.' },
            { id: 'S-2', nameEn: 'Bookkeeping (Monthly)', nameAr: 'مسك الدفاتر (شهري)', price: 1500, description: 'Monthly bookkeeping up to 50 trans.' },
            { id: 'S-3', nameEn: 'Zakat Filing', nameAr: 'إقرار الزكاة', price: 2500, description: 'Annual Zakat filing.' },
        ];

        for (const s of services) {
            await prisma.service.upsert({
                where: { id: s.id },
                update: {},
                create: s
            });
        }

        // 2. Mock Clients (Matches MOCK_CLIENTS in frontend roughly)
        // We only strictly need the ID to match so FK works.
        const clients = [
            { id: 'C-1', email: 'client1@example.com', name: 'Ahmed Al-Saud', role: 'CLIENT', companyName: 'Future Tech', zatcaStatus: 'GREEN' },
            { id: 'C-2', email: 'client2@example.com', name: 'Sara Smith', role: 'CLIENT', companyName: 'Global Trade', zatcaStatus: 'YELLOW' }
        ];

        for (const c of clients) {
            await prisma.user.upsert({
                where: { email: c.email },
                update: {},
                create: c
            });
        }

        // 3. Mock Experts
        const experts = [
            { id: 'E-1', email: 'expert1@example.com', name: 'Dr. Faisal', role: 'EXPERT', specializations: 'VAT, Zakat', status: 'ACTIVE' }
        ];

        for (const e of experts) {
            await prisma.user.upsert({
                where: { email: e.email },
                update: {},
                create: e
            });
        }

        return NextResponse.json({ success: true, message: 'Database seeded successfully' });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
