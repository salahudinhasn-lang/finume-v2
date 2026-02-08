
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting synchronization of Expert names from User table...');

    const experts = await prisma.expert.findMany({
        include: {
            user: true
        }
    });

    console.log(`Found ${experts.length} experts.`);

    let updatedCount = 0;

    for (const expert of experts) {
        if (expert.user && expert.user.name) {
            if (expert.name !== expert.user.name) {
                await prisma.expert.update({
                    where: { id: expert.id },
                    data: { name: expert.user.name }
                });
                updatedCount++;
                // console.log(`Updated Expert ${expert.id} with name: ${expert.user.name}`);
            }
        }
    }

    console.log(`Sync complete. Updated ${updatedCount} experts.`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
