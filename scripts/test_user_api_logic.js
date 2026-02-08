
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function GET() {
    try {
        console.log('Simulating GET /api/users ...');
        const users = await prisma.user.findMany({
            include: {
                clientProfile: { include: { permissions: true } },
                expertProfile: true,
                adminProfile: true
            }
        });

        const clients = [];
        const experts = [];
        const admins = [];

        for (const user of users) {
            const { passwordHash, clientProfile, expertProfile, adminProfile, ...baseUser } = user;

            if (user.role === 'CLIENT' && clientProfile) {
                clients.push({ ...baseUser, ...clientProfile, role: 'CLIENT' });
            } else if (user.role === 'EXPERT' && expertProfile) {
                // Logic from route.ts
                const mergedName = expertProfile.name || baseUser.name;
                experts.push({ ...baseUser, ...expertProfile, name: mergedName, role: 'EXPERT' });
            } else if (user.role === 'ADMIN' && adminProfile) {
                admins.push({ ...baseUser, ...adminProfile, role: 'ADMIN' });
            }
        }

        console.log('Result Experts:', JSON.stringify(experts, null, 2));
        return {
            clients,
            experts,
            admins
        };
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return { error: 'Failed to fetch users' };
    }
}

GET().finally(() => prisma.$disconnect());
