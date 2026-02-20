const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../frontend/node_modules/.prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

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
        update: {
            allowedEmailDomain: 'example.com', // Ensure existing installs are fixed
            name: 'Abhee Organization'
        },
        create: {
            id: 'default-tenant-cuid',
            slug: 'default',
            name: 'Abhee Organization',
            subdomain: 'app',
            domainVerified: true,
            allowedEmailDomain: 'example.com', // Match the seed users (@example.com)
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

    // 5. Create 57 Users for Org Chart Hierarchy
    const firstNames = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle', 'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Edward', 'Deborah', 'Ronald', 'Stephanie', 'Timothy', 'Rebecca', 'Jason', 'Sharon', 'Jeffrey', 'Laura'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner', 'Diaz', 'Parker', 'Cruz', 'Edwards'];

    console.log('🌱 Generating 57 Hierarchy Users...');

    // Distribute 57 users into bands
    const extUsers = [];
    let userIdCounter = 1;

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    async function createUser(roleName, titleName, managerId = null) {
        const f = pickRandom(firstNames);
        const l = pickRandom(lastNames);
        const role = await getRoleId(roleName);
        const title = await prisma.title.findFirst({ where: { name: titleName, tenantId } });

        const email = `${f.toLowerCase()}.${l.toLowerCase()}${userIdCounter++}@example.com`;
        return await prisma.user.upsert({
            where: { email_tenantId: { email, tenantId } },
            update: { roleId: role, titleId: title?.id, managerId },
            create: {
                email,
                name: `${f} ${l}`,
                role: roleName,
                roleId: role,
                title: title?.name,
                titleId: title?.id,
                managerId,
                tenantId
            }
        });
    }

    // Level 1: Execs reporting to Admin (CEO)
    const cto = await createUser('EXECUTIVE', 'CTO', admin.id);
    const vp1 = await createUser('EXECUTIVE', 'VP', admin.id);
    const vp2 = await createUser('EXECUTIVE', 'VP', admin.id);
    extUsers.push(cto, vp1, vp2);

    // Level 2: Directors (2 per VP/CTO = 6)
    const directors = [];
    for (let i = 0; i < 6; i++) {
        const mgr = i < 2 ? cto.id : i < 4 ? vp1.id : vp2.id;
        directors.push(await createUser('MANAGER', 'Director', mgr));
    }
    extUsers.push(...directors);

    // Level 3: Managers (2 per Director = 12)
    const managers = [];
    for (let i = 0; i < 12; i++) {
        const parentId = directors[Math.floor(i / 2)].id;
        managers.push(await createUser('MANAGER', 'Manager', parentId));
    }
    extUsers.push(...managers);

    // Level 4: ICs (36 ICs distributed among Managers, total = 3 + 6 + 12 + 36 = 57)
    const icTitles = ['Customer Success Manager', 'Project Manager', 'Technical Project Manager', 'Account Manager', 'Team Lead'];
    for (let i = 0; i < 36; i++) {
        const parentId = managers[Math.floor(i / 3)].id;
        extUsers.push(await createUser('MANAGER', pickRandom(icTitles), parentId));
    }

    // 5b. Seed Services (required before clients)
    const serviceNames = ['MSS', 'ITO', 'MEA', 'MIS', 'vCISO'];
    const serviceMap = {};
    for (const svcName of serviceNames) {
        const svc = await prisma.service.upsert({
            where: { name_tenantId: { name: svcName, tenantId } },
            update: {},
            create: { name: svcName, tenantId }
        });
        serviceMap[svcName] = svc.id;
    }

    // 5c. Seed Engagements
    const engNames = ['Annual Subscription', 'Implementation', 'Advisory Retainer', 'SOC 2 Readiness', 'Vulnerability Assessment'];
    const engMap = {};
    for (const ename of engNames) {
        const eng = await prisma.engagement.upsert({
            where: { name_tenantId: { name: ename, tenantId } },
            update: {},
            create: { name: ename, tenantId, description: 'Dummy engagement' }
        });
        engMap[ename] = eng.id;
    }

    console.log('🌱 Generating 200 Clients...');
    const pmoDept = await prisma.department.findFirst({ where: { name: 'PMO', tenantId } });

    if (pmoDept && admin) {
        const clientPromises = [];
        const statuses = ['GREEN', 'AMBER', 'RED', 'UNKNOWN'];
        const engStatuses = ['OPEN', 'ONGOING', 'CLOSED'];

        for (let i = 1; i <= 200; i++) {
            const companyName = `${pickRandom(lastNames)} ${pickRandom(['Corp', 'Inc', 'LLC', 'Enterprises', 'Solutions', 'Holdings', 'Tech', 'Systems'])} ${i}`;
            const svc = pickRandom(serviceNames);
            const eng = pickRandom(engNames);
            const status = pickRandom(statuses);
            const engStatus = pickRandom(engStatuses);
            const revenue = Math.floor(Math.random() * 950000) + 50000; // 50k to 1M
            const nps = Math.floor(Math.random() * 201) - 100; // -100 to 100
            const kudos = Math.floor(Math.random() * 15); // 0 to 14

            // Randomly assign team members (30% chance for each slot to be filled)
            const ownerId = pickRandom(extUsers).id;
            const accountableId = pickRandom(extUsers).id;
            const pmId = Math.random() > 0.3 ? pickRandom(extUsers).id : null;
            const csmId = Math.random() > 0.3 ? pickRandom(extUsers).id : null;
            const amId = Math.random() > 0.3 ? pickRandom(extUsers).id : null;
            const vcisoId = Math.random() > 0.5 ? pickRandom(extUsers).id : null;

            const comments = Math.random() > 0.5 ? "Client is relatively stable, tracking towards quarterly goals." : "Needs more attention this month due to staff turnover.";
            const execComments = Math.random() > 0.7 ? "Flagged for Q3 expansion talks." : null;
            const next = Math.random() > 0.5 ? "Schedule sync next Tuesday." : "Follow up on invoice.";

            clientPromises.push(
                prisma.client.upsert({
                    where: { id: `client-${companyName.replace(/\s+/g, '-').toLowerCase()}` },
                    update: {},
                    create: {
                        name: companyName,
                        serviceId: serviceMap[svc] ?? null,
                        engagementId: engMap[eng] ?? null,
                        status: status,
                        engagementStatus: engStatus,
                        revenue: revenue,
                        nps: nps,
                        kudos: kudos,
                        ownerId,
                        accountableId,
                        csmId,
                        pmId,
                        amId,
                        vcisoId,
                        departmentId: pmoDept.id,
                        csmPmComments: comments,
                        executiveComments: execComments,
                        nextSteps: next,
                        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)), // Random date in past months
                        tenantId
                    }
                })
            );

            // Batch create to avoid overwhelming Prisma
            if (clientPromises.length > 20) {
                await Promise.all(clientPromises);
                clientPromises.length = 0;
            }
        }
        if (clientPromises.length > 0) {
            await Promise.all(clientPromises);
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
