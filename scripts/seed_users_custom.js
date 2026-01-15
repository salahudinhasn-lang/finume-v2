
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding users with custom IDs...');

    // Wipe existing users (optional but recommended for clean slate as per user request)
    await prisma.request.deleteMany({});
    await prisma.clientProfile.deleteMany({});
    await prisma.expertProfile.deleteMany({});
    await prisma.adminProfile.deleteMany({});
    await prisma.user.deleteMany({});

    const passwordHash = await bcrypt.hash('123456', 10);

    // Create Client
    const client = await prisma.user.create({
        data: {
            id: 'CUS-000001',
            name: 'Test Client',
            email: 'client@finume.com',
            passwordHash,
            role: 'CLIENT',
            clientProfile: {
                create: {
                    companyName: 'Finume Client Co',
                    industry: 'Tech'
                }
            }
        }
    });
    console.log('Created Client: CUS-000001');

    // Create Expert
    const expert = await prisma.user.create({
        data: {
            id: 'EXP-000001',
            name: 'Test Expert',
            email: 'expert@finume.com',
            passwordHash,
            role: 'EXPERT',
            expertProfile: {
                create: {
                    bio: 'Financial Expert',
                    hourlyRate: 150,
                    kycStatus: 'APPROVED',
                    specializations: ["Tax", "Audit"]
                }
            }
        }
    });
    console.log('Created Expert: EXP-000001');

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            id: 'ADM-000001',
            name: 'Test Admin',
            email: 'admin@finume.com',
            passwordHash,
            role: 'ADMIN',
            adminProfile: {
                create: {
                    adminLevel: 'OPS'
                }
            }
        }
    });
    console.log('Created Admin: ADM-000001');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
