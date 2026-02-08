
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DEBUGGING DATABASE ---');

    // 1. Count Users by Role
    const userCounts = await prisma.user.groupBy({
        by: ['role'],
        _count: true
    });
    console.log('User Counts by Role:', userCounts);

    // 2. Fetch All Experts (User Relation)
    const expertUsers = await prisma.user.findMany({
        where: { role: 'EXPERT' },
        include: { expertProfile: true }
    });

    console.log(`\nFound ${expertUsers.length} Users with role EXPERT:`);
    expertUsers.forEach(u => {
        console.log(`- UserID: ${u.id}, Name: ${u.name}, HasProfile: ${!!u.expertProfile}`);
        if (u.expertProfile) {
            console.log(`  Profile ID: ${u.expertProfile.id}, Status: ${u.expertProfile.status}, Name in Profile: ${u.expertProfile.name}, Specializations: ${u.expertProfile.specializations}`);
        } else {
            console.log('  [WARNING] No Expert Profile linkage!');
        }
    });

    // 3. Fetch Expert Table directly
    const expertTable = await prisma.expert.findMany();
    console.log(`\nFound ${expertTable.length} records in Expert table directly:`);
    expertTable.forEach(e => {
        console.log(`- ID: ${e.id}, Status: ${e.status}, Name: ${e.name}`);
    });

}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
