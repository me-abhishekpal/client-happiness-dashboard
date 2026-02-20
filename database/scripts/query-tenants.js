const { PrismaClient } = require('../../frontend/node_modules/.prisma/client');
const prisma = new PrismaClient();

async function check() {
    const tenants = await prisma.tenant.findMany();
    console.log("Tenants:", JSON.stringify(tenants, null, 2));
    const users = await prisma.user.findMany({ select: { email: true, tenantId: true, inviteToken: true, inviteTokenExpiry: true } });
    console.log("Users:", JSON.stringify(users, null, 2));
}
check().finally(() => prisma.$disconnect());
