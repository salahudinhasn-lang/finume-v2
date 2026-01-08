
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAndSeed() {
    // 1. Clear Existing Plans/Services (Optional: Keep if you want)
    // await prisma.pricingPlan.deleteMany({});

    // 2. Define Table Config (Rows)
    const tableConfig = [
        { id: 'vat_reg', label: 'VAT Registration', section: 'Features', type: 'boolean' },
        { id: 'quarterly_filing', label: 'Quarterly Filing', section: 'Features', type: 'boolean' },
        { id: 'monthly_books', label: 'Monthly Bookkeeping', section: 'Features', type: 'boolean' },
        { id: 'ded_accountant', label: 'Dedicated Accountant', section: 'Features', type: 'text' },
        { id: 'zakat', label: 'Zakat Filing', section: 'Features', type: 'text' },
        { id: 'audit', label: 'Audit Support', section: 'Features', type: 'boolean' },
        { id: 'cfo', label: 'CFO Consultation', section: 'Features', type: 'text' },
        { id: 'fine_guarantee', label: 'Fine Guarantee', section: 'Features', type: 'text' }
    ];

    await prisma.platformSettings.upsert({
        where: { id: 'global' },
        update: { pricingTableConfig: JSON.stringify(tableConfig) },
        create: { pricingTableConfig: JSON.stringify(tableConfig) }
    });

    // 3. Define Plans with Attributes
    const plans = [
        {
            id: 'PLAN-00001',
            name: 'CR Guard',
            price: 500,
            description: 'Keep my legal status active',
            tagline: 'Best for maintaining legal status with minimal activity',
            guarantee: 'Basic Compliance',
            features: JSON.stringify(['Zero-filing VAT', 'Zakat Est. Filing', 'Basic Annual Qawaem']),
            attributes: JSON.stringify({
                vat_reg: true,
                quarterly_filing: '-',
                monthly_books: '-',
                ded_accountant: '-',
                zakat: 'Estimated',
                audit: false,
                cfo: '-',
                fine_guarantee: 'Basic'
            }),
            color: 'border-blue-500'
        },
        {
            id: 'PLAN-00002',
            name: 'ZATCA Shield',
            price: 1750,
            description: 'Avoid fines & stay compliant',
            tagline: 'Full protection against fines and penalties',
            guarantee: 'Fine Protection (100%)',
            isPopular: true,
            features: JSON.stringify(['Monthly VAT Filing', 'Zakat Filing', 'Dedicated Accountant', 'Audit Protection']),
            attributes: JSON.stringify({
                vat_reg: true,
                quarterly_filing: true,
                monthly_books: true,
                ded_accountant: 'Shared Team',
                zakat: true,
                audit: '-',
                cfo: '-',
                fine_guarantee: 'Full Coverage'
            }),
            color: 'border-indigo-500'
        },
        {
            id: 'PLAN-00003',
            name: 'Audit Proof',
            price: 5000,
            description: 'CFO-level governance',
            tagline: 'Complete financial peace of mind',
            guarantee: 'Full + Legal',
            features: JSON.stringify(['Unlimited Transactions', 'CFO Consultation', 'Full ERP Access', 'Legal Support']),
            attributes: JSON.stringify({
                vat_reg: true,
                quarterly_filing: true,
                monthly_books: true,
                ded_accountant: 'Dedicated Expert',
                zakat: true,
                audit: true,
                cfo: 'Monthly Call',
                fine_guarantee: 'Full + Legal'
            }),
            color: 'border-purple-500'
        }
    ];

    for (const p of plans) {
        await prisma.pricingPlan.upsert({
            where: { id: p.id },
            update: p,
            create: p
        });
    }

    console.log('Seeded Dynamic Pricing Table Configuration');
}

cleanAndSeed()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
