const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../frontend/node_modules/.prisma/client');

const prisma = new PrismaClient(); // Connects to the Prisma generated client in local node_modules

async function main() {
    let tenant = await prisma.tenant.findUnique({ where: { slug: 'app-rag' } });
    if (!tenant) {
        tenant = await prisma.tenant.upsert({
            where: { slug: 'app-rag' },
            create: {
                id: 'app-rag-tenant-cuid',
                slug: 'app-rag',
                name: 'App Rag Organization',
                subdomain: 'app-rag',
                customDomain: 'app-rag.abhee.org',
                domainVerified: true,
                allowedEmailDomain: 'example.com',
                plan: 'enterprise',
                status: 'active'
            },
            update: {}
        });

        await prisma.role.upsert({
            where: { name_tenantId: { name: 'ADMIN', tenantId: tenant.id } },
            create: {
                name: 'ADMIN',
                description: 'Full access',
                permissions: JSON.stringify(['*']),
                tenantId: tenant.id
            },
            update: {}
        });
    }

    const role = await prisma.role.findUnique({
        where: { name_tenantId: { name: 'ADMIN', tenantId: tenant.id } }
    });

    const passwordHash = await bcrypt.hash('8378hjww763428', 10);

    await prisma.user.upsert({
        where: { email: 'donald.torres3@example.com' },
        update: { passwordHash, tenantId: tenant.id, roleId: role.id, role: 'ADMIN' },
        create: {
            email: 'donald.torres3@example.com',
            name: 'Donald Torres',
            passwordHash,
            tenantId: tenant.id,
            roleId: role.id,
            role: 'ADMIN',
            permissions: JSON.stringify(['*'])
        }
    });

    console.log("✅ Created user donald.torres3@example.com for app-rag.abhee.org");
}
main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
