import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('STARTING DATABASE WIPE (Preserving Admin)...');

    try {
        // 1. Delete dependent data first
        console.log('Deleting dependent data...');
        // Order matters due to foreign keys if cascade isn't set everywhere
        await prisma.invoice.deleteMany({});
        await prisma.transaction.deleteMany({});
        await prisma.fileBatch.deleteMany({});
        await prisma.uploadedFile.deleteMany({});
        await prisma.requestMessage.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.dispute.deleteMany({});
        await prisma.notification.deleteMany({});
        await prisma.auditLog.deleteMany({});
        await prisma.providerPool.deleteMany({});
        await prisma.payoutRequest.deleteMany({});
        await prisma.expertTask.deleteMany({});

        // 2. Delete Requests
        console.log('Deleting requests...');
        await prisma.request.deleteMany({});

        // 3. Delete Profiles (Client, Expert, etc.) - except Admin
        console.log('Deleting profiles...');
        await prisma.teamMember.deleteMany({});
        await prisma.gamificationProfile.deleteMany({});
        await prisma.clientFeaturePermissions.deleteMany({});

        // Delete Clients and Experts (User deletion will cascade, but we can be explicit)
        // Actually, we want to delete USERS who are NOT admins.

        // 4. Delete Users (Except Admin)
        console.log('Deleting non-admin users...');
        const deleteUsers = await prisma.user.deleteMany({
            where: {
                role: {
                    not: 'ADMIN'
                }
            }
        });
        console.log(`Deleted ${deleteUsers.count} users.`);

        console.log('DATABASE WIPE COMPLETE.');
    } catch (error) {
        console.error('Error during wipe:', error);
    }
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
