const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning up Service table...');

    try {
        // 1. Remove SERV-SUBSCRIPTION
        const sub = await prisma.service.deleteMany({
            where: {
                id: 'SERV-SUBSCRIPTION'
            }
        });
        console.log(`Deleted ${sub.count} SERV-SUBSCRIPTION records.`);

        // 2. Remove PLAN-xxxxx IDs
        const plans = await prisma.service.deleteMany({
            where: {
                id: {
                    startsWith: 'PLAN-'
                }
            }
        });
        console.log(`Deleted ${plans.count} PLAN-xxxxx records.`);

    } catch (e) {
        console.error('Error cleaning up:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
