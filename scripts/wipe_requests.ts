
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Using database URL:', process.env.DATABASE_URL);
    try {
        // Delete files and batches first due to cascade, but usually cascade handles it.
        // Explicitly deleting to be safe.
        await prisma.uploadedFile.deleteMany({});
        await prisma.fileBatch.deleteMany({});

        // Delete requests
        const { count } = await prisma.request.deleteMany({});
        console.log(`Deleted ${count} requests.`);
    } catch (error) {
        console.error('Error wiping requests:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
