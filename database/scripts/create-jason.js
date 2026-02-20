const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../frontend/node_modules/.prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/client_happiness?schema=public' });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    let tenant = await prisma.tenant.findUnique({ where: { slug: 'app-rag' } });
    if (!tenant) {
        console.error("❌ app-rag tenant not found. Please ensure it was created.");
        process.exit(1);
    }

    // Ensure we have an ADMIN role
    let role = await prisma.role.findFirst({
        where: { name: 'ADMIN', tenantId: tenant.id }
    });

    if (!role) {
        role = await prisma.role.upsert({
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

    const passwordHash = await bcrypt.hash('aoidu8eyeuya87', 10);

    await prisma.user.upsert({
        where: { email: 'jason.diaz57@example.com' },
        update: {
            passwordHash,
            tenantId: tenant.id,
            roleId: role.id,
            role: 'ADMIN',
            mfaEnabled: false, // User will configure MFA on first use
            mfaSecret: null
        },
        create: {
            email: 'jason.diaz57@example.com',
            name: 'Jason Diaz',
            passwordHash,
            tenantId: tenant.id,
            roleId: role.id,
            role: 'ADMIN',
            permissions: JSON.stringify(['*']),
            mfaEnabled: false,
            mfaSecret: null
        }
    });

    console.log("✅ Created user jason.diaz57@example.com for app-rag.abhee.org");
    console.log("Password: aoidu8eyeuya87");
}
main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
