
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = 'cus-000001'; // The seeded client
    console.log('Testing update for user:', userId);

    // 1. Fetch before
    const before = await prisma.user.findUnique({
        where: { id: userId },
        include: { clientProfile: true }
    });
    console.log('BEFORE:', JSON.stringify(before, null, 2));

    // 2. Simulate API Payload
    // Note: The API handler manually separates fields. Here we simulate the API logic manually? 
    // better to use fetch if we had a running server, but we don't.
    // Instead, let's call the core update logic that the API uses.

    const updates = {
        name: 'Updated Name API Test',
        mobileNumber: '+966 999999999',
        companyName: 'Updated Company API Test',
        crNumber: 'CR-TEST-1234',
        jobTitle: 'CTO Test'
    };

    console.log('Applying updates:', updates);

    // LOGIC FROM API ROUTE:
    const userUpdateData: any = {};
    if (updates.name) userUpdateData.name = updates.name;
    if (updates.mobileNumber) userUpdateData.mobileNumber = updates.mobileNumber;

    const { name, mobileNumber, ...profileData } = updates;

    if (userId.startsWith('cus-')) {
        userUpdateData.clientProfile = {
            update: {
                ...profileData
            }
        };
    }

    // Execute Update
    try {
        const result = await prisma.user.update({
            where: { id: userId },
            data: userUpdateData,
            include: { clientProfile: true }
        });
        console.log('RESULT:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('Update failed:', e);
    }

    // 3. Clean up (Revert)
    // await prisma.user.update({ where: { id: userId }, data: { name: before.name } });

    await prisma.$disconnect();
}

main();
