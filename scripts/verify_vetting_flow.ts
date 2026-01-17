
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyVettingFlow() {
    console.log("Starting Verification of Expert Vetting Flow...");

    const testEmail = `expert_vetting_test_${Date.now()}@test.com`;

    // 1. Simulate Registration (Create User + ExpertProfile)
    console.log(`\n1. Registering new Expert: ${testEmail}`);
    const user = await prisma.user.create({
        data: {
            id: `exp-test-${Date.now()}`,
            name: 'Vetting Test Expert',
            email: testEmail,
            passwordHash: 'dummy',
            role: 'EXPERT',
            expertProfile: {
                create: {
                    bio: 'I am a new expert needing vetting.',
                    hourlyRate: 100,
                    specializations: ['Finance'],
                    // status: Default should be VETTING
                }
            }
        },
        include: { expertProfile: true }
    });

    if (user.expertProfile?.status === 'VETTING') {
        console.log("✅ SUCCESS: New expert has status 'VETTING' by default.");
    } else {
        console.error(`❌ FAILURE: New expert has status '${user.expertProfile?.status}' (Expected: VETTING)`);
    }

    // 2. Simulate Admin Approval (Update Status to ACTIVE)
    console.log(`\n2. Admin Approving Expert (Setting status to ACTIVE)...`);
    const updatedExpert = await prisma.expert.update({
        where: { id: user.id },
        data: { status: 'ACTIVE' }
    });

    if (updatedExpert.status === 'ACTIVE') {
        console.log("✅ SUCCESS: Expert status updated to 'ACTIVE'.");
    } else {
        console.error(`❌ FAILURE: Expert status is '${updatedExpert.status}' (Expected: ACTIVE)`);
    }

    // 3. Simulate Pool Invite Logic (Check if ACTIVE expert gets invited)
    // We won't run the actual API but we verify the query logic:
    console.log(`\n3. Verifying Availability for Pool...`);
    const activeExperts = await prisma.expert.findMany({
        where: { status: 'ACTIVE', id: user.id }
    });

    if (activeExperts.length === 1) {
        console.log("✅ SUCCESS: Expert found in ACTIVE pool query.");
    } else {
        console.error("❌ FAILURE: Expert NOT found in ACTIVE pool query.");
    }

    // Cleanup
    await prisma.user.delete({ where: { id: user.id } });
    console.log("\nCleanup complete.");
}

verifyVettingFlow()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
