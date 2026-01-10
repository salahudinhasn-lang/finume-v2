const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting sync of PricingPlans to Services...');

    // 1. Fetch all Pricing Plans
    const plans = await prisma.pricingPlan.findMany();
    console.log(`Found ${plans.length} pricing plans.`);

    // 2. Upsert each Plan as a Service
    for (const plan of plans) {
        console.log(`Syncing Plan: ${plan.name} (${plan.id})`);

        await prisma.service.upsert({
            where: { id: plan.id },
            update: {
                nameEn: plan.name,
                nameAr: plan.name, // Fallback as we don't have Arabic name in Plan
                price: plan.price,
                description: plan.description || plan.tagline || ''
            },
            create: {
                id: plan.id,
                nameEn: plan.name,
                nameAr: plan.name,
                price: plan.price,
                description: plan.description || plan.tagline || ''
            }
        });
    }

    console.log('Sync completed successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
