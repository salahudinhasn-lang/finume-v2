import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting cleanup of Services table...');

    try {
        // Valid Service IDs we want to keep
        const validServiceIds = ['S1', 'S2', 'S3', 'S4', 'S5'];

        // Delete any service whose ID is NOT in the valid list
        const result = await prisma.service.deleteMany({
            where: {
                id: {
                    notIn: validServiceIds,
                },
            },
        });

        console.log(`Cleanup complete. Deleted ${result.count} invalid services.`);
    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
