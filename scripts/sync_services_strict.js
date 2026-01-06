const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const VALID_SERVICES = [
    { id: 'SERV-00001', nameEn: 'VAT Filing', nameAr: 'إقرار ضريبة القيمة المضافة', price: 500, description: 'Complete VAT return filing with ZATCA' },
    { id: 'SERV-00002', nameEn: 'Bookkeeping (Monthly)', nameAr: 'مسك الدفاتر (شهري)', price: 2500, description: 'Monthly financial record keeping' },
    { id: 'SERV-00003', nameEn: 'Financial Audit', nameAr: 'تدقيق مالي', price: 15000, description: 'Full annual financial audit' },
    { id: 'SERV-00004', nameEn: 'Zakat Advisory', nameAr: 'استشارات الزكاة', price: 1000, description: 'Consultation on Zakat calculation' },
    { id: 'SERV-00005', nameEn: 'CFO Advisory', nameAr: 'استشارات المدير المالي', price: 5000, description: 'Strategic financial planning' },
    // System Service for Plans (Required for FK constraints)
    { id: 'SERV-SUBSCRIPTION', nameEn: 'Plan Subscription', nameAr: 'اشتراك باقة', price: 0, description: 'Recurring Plan Subscription' }
];

async function main() {
    console.log('Starting Strict Service Sync...');

    // 1. Upsert Valid Services
    for (const s of VALID_SERVICES) {
        await prisma.service.upsert({
            where: { id: s.id },
            update: s,
            create: s,
        });
        console.log(`Upserted: ${s.id} - ${s.nameEn}`);
    }

    // 2. Identify Invalid Services
    const allServices = await prisma.service.findMany();
    const validIds = new Set(VALID_SERVICES.map(s => s.id));
    const invalidServices = allServices.filter(s => !validIds.has(s.id));

    if (invalidServices.length > 0) {
        console.log(`Found ${invalidServices.length} invalid services to remove.`);

        // 3. Migrate/Cleanup Requests
        // Move any requests pointing to invalid services to 'SERV-00002' (Bookkeeping) as a safe holding spot, or SERV-SUBSCRIPTION if it was a plan.
        // Simplifying: Move all to SERV-00002 to satisfy FK, then delete service.
        // If request was for a Plan (started with PLAN-), ideally we move to SERV-SUBSCRIPTION?
        // Let's check IDs.

        for (const badService of invalidServices) {
            console.log(`Processing removal of ${badService.id}...`);

            // Reassign requests
            // Create a raw query or prisma update
            // If the bad service ID looks like a plan, move to SERV-SUBSCRIPTION
            const targetId = (badService.id.startsWith('PLAN') || badService.nameEn.includes('Plan'))
                ? 'SERV-SUBSCRIPTION'
                : 'SERV-00002';

            const updateResult = await prisma.request.updateMany({
                where: { serviceId: badService.id },
                data: { serviceId: targetId }
            });
            console.log(`  Migrated ${updateResult.count} requests to ${targetId}`);

            // Delete the service
            await prisma.service.delete({
                where: { id: badService.id }
            });
            console.log(`  Deleted service ${badService.id}`);
        }
    } else {
        console.log('No invalid services found.');
    }

    console.log('Sync Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
