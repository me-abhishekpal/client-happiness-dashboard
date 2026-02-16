// database/cleanup-status.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Starting status standardization...');

    const critical = await prisma.client.updateMany({
        where: { status: 'CRITICAL' },
        data: { status: 'RED' }
    });
    console.log(`🔴 CRITICAL -> RED: ${critical.count}`);

    const atRisk = await prisma.client.updateMany({
        where: { status: 'AT_RISK' },
        data: { status: 'AMBER' }
    });
    console.log(`🟡 AT_RISK -> AMBER: ${atRisk.count}`);

    const healthy = await prisma.client.updateMany({
        where: { status: 'HEALTHY' },
        data: { status: 'GREEN' }
    });
    console.log(`🟢 HEALTHY -> GREEN: ${healthy.count}`);

    console.log('✨ Cleanup complete!');
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
