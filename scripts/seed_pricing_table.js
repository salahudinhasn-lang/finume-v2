
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAndSeed() {
    // 1. Clear Existing Plans/Services (Optional: Keep if you want)
    // await prisma.pricingPlan.deleteMany({});

    // 2. Define Table Config (Rows)
    // 2. Define Table Config (Rows)
    const tableConfig = [
        // Features (Image 1)
        { id: 'vat_reg', label: 'VAT Registration', section: 'Features', type: 'boolean' },
        { id: 'quarterly_filing', label: 'Quarterly Filing', section: 'Features', type: 'boolean' },
        { id: 'monthly_books', label: 'Monthly Bookkeeping', section: 'Features', type: 'boolean' },
        { id: 'ded_accountant', label: 'Dedicated Accountant', section: 'Features', type: 'text' },
        { id: 'zakat', label: 'Zakat Filing', section: 'Features', type: 'text' },
        { id: 'audit', label: 'Audit Support', section: 'Features', type: 'boolean' },
        { id: 'cfo', label: 'CFO Consultation', section: 'Features', type: 'text' },

        // Financial Thresholds (Image 0)
        { id: 'revenue', label: 'Annual Revenue', section: 'Financial Limits', type: 'text' },
        { id: 'transactions', label: 'Monthly Transactions', section: 'Financial Limits', type: 'text' },
        { id: 'invoices', label: 'Monthly Invoices (Sales)', section: 'Financial Limits', type: 'text' },
        { id: 'bills', label: 'Monthly Bills (Purchases)', section: 'Financial Limits', type: 'text' },

        // Operational Limits (Image 0)
        { id: 'bank_accounts', label: 'Bank Accounts', section: 'Operational Limits', type: 'text' },
        { id: 'employees', label: 'Employees (Payroll)', section: 'Operational Limits', type: 'text' },

        // Advanced Features (Image 0)
        { id: 'international', label: 'International Transactions', section: 'Advanced Features', type: 'text' },
        { id: 'stock', label: 'Stock / Inventory', section: 'Advanced Features', type: 'text' },
        { id: 'contracts', label: 'Recurring Contracts', section: 'Advanced Features', type: 'text' },

        // Guarantee (Both)
        { id: 'fine_guarantee', label: 'Fine Protection Guarantee', section: 'Features', type: 'text' }
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
            tagline: 'Keep my legal status active',
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
                fine_guarantee: 'Basic Compliance',
                revenue: '< 375k SAR',
                transactions: '< 50 / mo',
                invoices: '< 5 / mo',
                bills: '< 10 / mo',
                bank_accounts: '1 Account',
                employees: 'None',
                international: false,
                stock: '20 SKUs',
                contracts: false
            }),
            color: 'border-blue-500'
        },
        {
            id: 'PLAN-00002',
            name: 'ZATCA Shield',
            price: 1750,
            description: 'Avoid fines & stay compliant',
            tagline: 'Avoid fines & stay compliant',
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
                fine_guarantee: 'Fine Protection (100%)',
                revenue: '< 5M SAR',
                transactions: 'Up to 300 / mo',
                invoices: 'Unlimited',
                bills: 'Up to 100',
                bank_accounts: 'Up to 3',
                employees: 'Up to 10',
                international: 'Limit 10/mo',
                stock: '20 SKUs',
                contracts: 'Up to 5'
            }),
            color: 'border-indigo-500'
        },
        {
            id: 'PLAN-00003',
            name: 'Audit Proof',
            price: 5000,
            description: 'CFO-level governance',
            tagline: 'CFO-level governance',
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
                fine_guarantee: 'Audit Defense Support',
                revenue: 'Unlimited',
                transactions: 'Unlimited',
                invoices: 'Unlimited',
                bills: 'Unlimited',
                bank_accounts: 'Unlimited',
                employees: 'Unlimited',
                international: true,
                stock: 'Full ERP',
                contracts: 'Unlimited'
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
