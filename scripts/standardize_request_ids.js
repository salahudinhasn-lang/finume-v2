const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Starting Request ID Standardization...');

    // 1. Fetch all requests
    const requests = await prisma.request.findMany({
        orderBy: { createdAt: 'asc' } // Preserve order
    });

    console.log(`Found ${requests.length} requests to process.`);

    let counter = 1;

    for (const req of requests) {
        const oldId = req.id;
        // Generate new ID: REQ-0000000001
        const newId = `REQ-${String(counter).padStart(10, '0')}`;
        counter++;

        // Check if ID is already correct format (optional optimization)
        if (oldId === newId) {
            console.log(`Skipping ${oldId} (already standardized)`);
            continue;
        }

        console.log(`Migrating ${oldId} -> ${newId}`);

        // Update using raw query to bypass potential foreign key checks (though update cascade is safer if defined)
        // Prisma doesn't support changing primary key easily in update().
        // We will Create New -> Update Relations -> Delete Old
        // BUT we have relations:
        // - FileBatch (requestId)
        // - Transaction (requestId)
        // - PayoutRequest (might store IDs in JSON string 'requestIds') -> This is tricky!
        // - Review (Embedded in Request model, so safe)

        // STRATEGY: 
        // 1. Create new request with matched data (except ID)
        // 2. Update FileBatch, Transaction to point to new ID
        // 3. Handle PayoutRequest: Check 'requestIds' string.
        // 4. Delete old request.

        // Transact for safety
        await prisma.$transaction(async (tx) => {
            // 1. Create Copy
            const { id, ...data } = req;
            // Cannot create with relations in one go easily if we want to move them.

            // Actually, renaming PK is hard.
            // Let's use raw SQL to update the ID directly and cascade manually or rely on DB.
            // Postgres supports updating PK.

            // Update Foreign Keys first? No, default behavior is restrict.
            // We have to defer constraints or update all in one go.
            // Let's try raw update of the PK. If it fails due to FK, we update FKs first? No, they point to old ID.
            // We need: Update all referencing tables to newID where FK = oldID, AND update Parent to newID.
            // But we can't point FK to newID before Parent has newID (unless deferred).
            // Postgres Constraint Deferring is not exposed in Prisma easily.

            // Alternative: Clone Strategy.
            // Create New Request (NewID).
            // Move Transactions (update requestId = NewID).
            // Move FileBatches (update requestId = NewID).
            // Delete Old Request.

            await tx.request.create({
                data: {
                    ...data,
                    id: newId
                }
            });

            await tx.transaction.updateMany({
                where: { requestId: oldId },
                data: { requestId: newId }
            });

            await tx.fileBatch.updateMany({
                where: { requestId: oldId },
                data: { requestId: newId }
            });

            await tx.request.delete({
                where: { id: oldId }
            });
        });

        // 5. Fix PayoutRequest JSON field (Post-transaction logic as it's loose coupling)
        // This is slow but safe for small data.
        const payouts = await prisma.payoutRequest.findMany();
        for (const p of payouts) {
            if (p.requestIds.includes(oldId)) {
                const newRequestIds = p.requestIds.replace(oldId, newId);
                await prisma.payoutRequest.update({
                    where: { id: p.id },
                    data: { requestIds: newRequestIds }
                });
                console.log(`  Updated PayoutRequest ${p.id} JSON reference.`);
            }
        }
    }

    console.log('Migration Complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
