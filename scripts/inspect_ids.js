const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Inspecting Request IDs...');
    const requests = await prisma.request.findMany({
        select: { id: true, status: true, createdAt: true }
    });
    console.log('Current Requests:', JSON.stringify(requests, null, 2));
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
