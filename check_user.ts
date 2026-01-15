
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Checking User model availability...');
    try {
        // Check if we can count
        const count = await prisma.user.count();
        console.log('Current user count:', count);

        // Try to create a dummy user
        const user = await prisma.user.create({
            data: {
                id: 'debug-user-01',
                email: 'debug@test.com',
                name: 'Debug User',
                passwordHash: 'hashedpassword',
                role: 'ADMIN'
            }
        });
        console.log('Successfully created debug user:', user.id);

        // Clean up
        await prisma.user.delete({ where: { id: 'debug-user-01' } });
        console.log('Cleaned up debug user');

    } catch (e) {
        console.error('Error during check:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
