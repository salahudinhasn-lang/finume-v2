
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting cleanup...');

    try {
        // 1. Delete Client Permissions first (foreign key constraint)
        await prisma.clientFeaturePermissions.deleteMany({
            where: {
                client: {
                    role: { not: 'ADMIN' }
                }
            }
        });
        console.log('Deleted client permissions.');

        // 2. Delete Users
        const deletedUsers = await prisma.user.deleteMany({
            where: {
                role: {
                    not: 'ADMIN'
                }
            }
        });
        console.log(`Deleted ${deletedUsers.count} non-admin users.`);
    } catch (e) {
        console.error('Error cleaning up:', e);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
