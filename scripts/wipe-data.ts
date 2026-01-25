
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🗑️  Starting Database Wipe (Keeping Admins)...');

    // 1. Delete transactional dependencies first to avoid FK constraints
    console.log('Deleting Limit / Transactional Data...');
    await prisma.review.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.invoice.deleteMany({});
    await prisma.dispute.deleteMany({});

    await prisma.meetingMessage.deleteMany({});
    await prisma.meeting.deleteMany({});

    await prisma.expertTask.deleteMany({});
    await prisma.payoutRequest.deleteMany({});
    await prisma.providerPool.deleteMany({});
    await prisma.requestMessage.deleteMany({});

    // 2. Delete Files & Batches
    console.log('Deleting Files & Batches...');
    await prisma.uploadedFile.deleteMany({});
    await prisma.fileBatch.deleteMany({});

    // 3. Delete Requests (Central HUB of data)
    console.log('Deleting Requests...');
    await prisma.request.deleteMany({});

    // 4. Delete Profile Specific Data
    console.log('Deleting Team Members & Notifications...');
    await prisma.teamMember.deleteMany({});
    await prisma.notification.deleteMany({});
    await prisma.auditLog.deleteMany({});
    await prisma.complianceLog.deleteMany({});
    await prisma.chatMessage.deleteMany({});
    await prisma.gamificationProfile.deleteMany({});
    await prisma.clientFeaturePermissions.deleteMany({});

    // 5. Delete Users (Except Admins)
    console.log('Deleting Users (Clients & Experts)...');

    // Note: We don't need to manually delete Client/Expert records because 
    // the schema usually has onDelete: Cascade on the relation to User.
    // But purely safe side, we could. However, `User` is the parent.

    const result = await prisma.user.deleteMany({
        where: {
            role: {
                notIn: ['ADMIN', 'SUPER_ADMIN']
            }
        }
    });

    console.log(`✅ Deleted ${result.count} non-admin users.`);
    console.log('✨ Data wipe complete. System Config (Services/Plans) & Admin Accounts preserved.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
