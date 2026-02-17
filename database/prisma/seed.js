const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../frontend/node_modules/.prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Multi-Tenant Seeding...');

    // 00. Create Super Admin
    const supAdminEmail = 'abhee@example.com';
    const passwordHash = await bcrypt.hash('password123', 10);
    await prisma.superAdmin.upsert({
        where: { email: supAdminEmail },
        update: { passwordHash },
        create: {
            email: supAdminEmail,
            name: 'Super Admin',
            passwordHash
        }
    });
    console.log('✅ Super Admin created');

    // 0. Create Default Tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'default' },
        update: {},
        create: {
            id: 'default-tenant-cuid',
            slug: 'default',
            name: 'Abhee Organization',
            subdomain: 'app',
            domainVerified: true,
            allowedEmailDomain: 'abhee.org',
            plan: 'enterprise',
            status: 'active'
        }
    });
    console.log(`✅ Default tenant created: ${tenant.name} (${tenant.slug})`);

    const tenantId = tenant.id;

    // 1. Define Roles & Permissions (Multi-Tenant)
    const roles = [
        {
            name: 'ADMIN',
            description: 'Full access to everything',
            permissions: JSON.stringify(['*']),
            tenantId
        },
        {
            name: 'EXECUTIVE',
            description: 'View dashboard and clients details',
            permissions: JSON.stringify(['dashboard', 'clients_read', 'reports']),
            tenantId
        },
        {
            name: 'MANAGER',
            description: 'Manage clients and view dashboard',
            permissions: JSON.stringify(['dashboard', 'clients_read', 'clients_write']),
            tenantId
        },
        {
            name: 'VIEWER',
            description: 'Read-only access',
            permissions: JSON.stringify(['dashboard']),
            tenantId
        }
    ];

    console.log('🌱 Seeding Roles...');
    for (const r of roles) {
        await prisma.role.upsert({
            where: { name_tenantId: { name: r.name, tenantId } },
            update: { permissions: r.permissions, description: r.description },
            create: r
        });
    }

    // 2. Create Departments (Multi-Tenant)
    const depts = [
        { name: 'MIS', tenantId },
        { name: 'MSS', tenantId },
        { name: 'MEA', tenantId },
        { name: 'ITO', tenantId },
        { name: 'PMO', tenantId },
    ];

    for (const dept of depts) {
        await prisma.department.upsert({
            where: { id: dept.name },
            update: { tenantId },
            create: {
                id: dept.name,
                name: dept.name,
                tenantId
            },
        });
    }

    // 3. Create Titles (Multi-Tenant)
    const titles = [
        { name: 'CEO', reportsTo: null },
        { name: 'CTO', reportsTo: 'CEO' },
        { name: 'VP', reportsTo: 'CEO' },
        { name: 'Director', reportsTo: 'VP' },
        { name: 'Manager', reportsTo: 'Director' },
        { name: 'Team Lead', reportsTo: 'Manager' },
        { name: 'Senior Associate', reportsTo: 'Team Lead' },
        { name: 'Associate', reportsTo: 'Senior Associate' },
        { name: 'Junior Associate', reportsTo: 'Associate' },
        { name: 'Intern', reportsTo: 'Junior Associate' },
        { name: 'Customer Success Manager', reportsTo: 'Manager' },
        { name: 'Project Manager', reportsTo: 'Manager' },
        { name: 'Technical Project Manager', reportsTo: 'Manager' },
        { name: 'Account Manager', reportsTo: 'Manager' },
    ];

    console.log('🌱 Seeding Titles...');
    for (const title of titles) {
        let reportsToId = null;
        if (title.reportsTo) {
            const parent = await prisma.title.findFirst({ where: { name: title.reportsTo, tenantId } });
            reportsToId = parent?.id;
        }

        await prisma.title.upsert({
            where: { name_tenantId: { name: title.name, tenantId } },
            update: { reportsToId },
            create: { name: title.name, reportsToId, tenantId }
        });
    }

    const getRoleId = async (name) => {
        const role = await prisma.role.findFirst({ where: { name, tenantId } });
        return role?.id;
    }

    const adminRole = await getRoleId('ADMIN');
    const execRole = await getRoleId('EXECUTIVE');

    // 4. Create Admin User
    const admin = await prisma.user.upsert({
        where: { email_tenantId: { email: 'abhee@example.com', tenantId } },
        update: { roleId: adminRole },
        create: {
            email: 'abhee@example.com',
            name: 'Abhee',
            role: 'ADMIN',
            roleId: adminRole,
            title: 'System Architect',
            departmentId: 'PMO',
            tenantId
        },
    });

    // 5. Create Executives
    const execs = [
        { email: 'vipin@example.com', name: 'Vipin', title: 'Executive' },
        { email: 'aj@example.com', name: 'AJ', title: 'Executive' },
        { email: 'jim@example.com', name: 'Jim', title: 'Executive' },
        { email: 'alex@example.com', name: 'Alex Morgan', title: 'Customer Success Manager' },
        { email: 'sarah@example.com', name: 'Sarah Connor', title: 'Project Manager' },
        { email: 'mike@example.com', name: 'Mike Ross', title: 'Technical Project Manager' },
    ];

    for (const exec of execs) {
        await prisma.user.upsert({
            where: { email_tenantId: { email: exec.email, tenantId } },
            update: { roleId: execRole },
            create: {
                email: exec.email,
                name: exec.name,
                role: 'EXECUTIVE',
                roleId: execRole,
                title: exec.title,
                tenantId
            },
        });
    }

    console.log('🌱 Seeding Clients...');
    const clients = [
        { name: 'Acme Corp', serviceType: 'MSS', status: 'GREEN' },
        { name: 'Globex Inc', serviceType: 'ITO', status: 'AMBER' },
        { name: 'Soylent Corp', serviceType: 'MEA', status: 'RED' }
    ];

    const pmoDept = await prisma.department.findFirst({ where: { name: 'PMO', tenantId } });

    if (pmoDept && admin) {
        for (const c of clients) {
            const existing = await prisma.client.findFirst({ where: { name: c.name, tenantId } });
            if (!existing) {
                await prisma.client.create({
                    data: {
                        name: c.name,
                        serviceType: c.serviceType,
                        status: c.status,
                        ownerId: admin.id,
                        departmentId: pmoDept.id,
                        lastUpdated: new Date(),
                        tenantId
                    }
                });
            }
        }
    }

    console.log('Seeding completed! 🌿');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
