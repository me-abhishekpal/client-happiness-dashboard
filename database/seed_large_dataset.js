const { PrismaClient } = require('../frontend/node_modules/.prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Starting Large Dataset Population...');

    // 1. Get the Default Tenant
    const tenant = await prisma.tenant.findUnique({ where: { slug: 'default' } });
    if (!tenant) throw new Error("Default tenant not found. Please run the initial seed first.");
    const tenantId = tenant.id;

    // 2. Get Roles
    const getRole = async (name) => {
        const role = await prisma.role.findFirst({ where: { name, tenantId } });
        return role ? role.id : null;
    };
    const execRole = await getRole('EXECUTIVE');
    const mgrRole = await getRole('MANAGER');

    // 3. Get Titles
    const getTitle = async (name) => {
        const title = await prisma.title.findFirst({ where: { name, tenantId } });
        return title ? title.id : null;
    };
    const ceoTitle = await getTitle('CEO');
    const vpTitle = await getTitle('VP');
    const dirTitle = await getTitle('Director');
    const mgrTitle = await getTitle('Manager');
    const execTitle = await getTitle('Executive');

    // 4. Get Departments
    const getDept = async (name) => {
        const dept = await prisma.department.findFirst({ where: { name, tenantId } });
        return dept ? dept.id : null;
    };
    const depts = {
        PMO: await getDept('PMO'),
        MSS: await getDept('MSS'),
        ITO: await getDept('ITO'),
        MEA: await getDept('MEA'),
        MIS: await getDept('MIS')
    };

    const deptKeys = Object.keys(depts);

    // ============================================
    // GENERATE USERS & ORG CHART (50+ Users)
    // ============================================
    console.log('🌱 Generating 50+ Users and Org Chart...');

    const createUser = async (name, role, roleId, title, titleId, deptId, managerId) => {
        const email = `${name.toLowerCase().replace(/ /g, '.')}@example.com`;

        // Skip if exists
        let user = await prisma.user.findFirst({ where: { email, tenantId } });
        if (user) return user;

        return await prisma.user.create({
            data: {
                email,
                name,
                role,
                roleId,
                title,
                titleId,
                departmentId: deptId,
                managerId,
                tenantId
            }
        });
    };

    // CEO (Level 1)
    const ceo = await createUser('Alice Lead', 'EXECUTIVE', execRole, 'CEO', ceoTitle, depts.PMO, null);

    // VPs (Level 2) - 3 VPs
    const vps = [];
    vps.push(await createUser('Bob Strategy', 'EXECUTIVE', execRole, 'VP', vpTitle, depts.PMO, ceo.id));
    vps.push(await createUser('Charlie Operations', 'EXECUTIVE', execRole, 'VP', vpTitle, depts.MSS, ceo.id));
    vps.push(await createUser('Diana Revenue', 'EXECUTIVE', execRole, 'VP', vpTitle, depts.MEA, ceo.id));

    // Directors (Level 3) - 6 Directors
    const directors = [];
    for (let i = 0; i < 6; i++) {
        const vpManager = vps[i % 3].id;
        directors.push(await createUser(`Dir Name_${i}`, 'MANAGER', mgrRole, 'Director', dirTitle, depts[deptKeys[i % 5]], vpManager));
    }

    // Managers (Level 4) - 15 Managers (Potential Client Owners)
    const managers = [];
    for (let i = 0; i < 15; i++) {
        const dirManager = directors[i % 6].id;
        managers.push(await createUser(`Mgr Name_${i}`, 'MANAGER', mgrRole, 'Manager', mgrTitle, depts[deptKeys[i % 5]], dirManager));
    }

    // Executives/Staff (Level 5) - 26 Staff
    const staff = [];
    for (let i = 0; i < 26; i++) {
        const mgrManager = managers[i % 15].id;
        staff.push(await createUser(`Staff Name_${i}`, 'EXECUTIVE', execRole, 'Executive', execTitle, depts[deptKeys[i % 5]], mgrManager));
    }

    console.log(`✅ Generated users layout: 1 CEO, 3 VPs, 6 Directors, 15 Managers, 26 Staff.`);

    // ============================================
    // GENERATE CLIENTS (200+ Clients)
    // ============================================
    console.log('🌱 Generating 200 diverse clients...');

    const prefixes = ['Global', 'Apex', 'Quantum', 'Nexus', 'Vertex', 'Pinnacle', 'Summit', 'Crest', 'Prime', 'Alpha', 'Omega', 'Zenith', 'Nova', 'Aura', 'Echo', 'Horizon', 'Meridian', 'Solstice', 'Equinox', 'Atlas'];
    const suffixes = ['Corp', 'Inc', 'LLC', 'Enterprises', 'Solutions', 'Systems', 'Technologies', 'Innovations', 'Dynamics', 'Logistics', 'Networks', 'Holdings', 'Group', 'Partners', 'Associates', 'Ventures', 'Labs', 'Industries', 'Services', 'Consulting'];

    let generatedClientCount = 0;

    for (let p of prefixes) {
        for (let s of suffixes) {
            if (generatedClientCount >= 200) break;

            const clientName = `${p} ${s}`;

            // Check if exists
            const existing = await prisma.client.findFirst({ where: { name: clientName, tenantId } });
            if (existing) continue;

            const owner = managers[Math.floor(Math.random() * managers.length)];
            const accountable = directors[Math.floor(Math.random() * directors.length)];
            const csm = staff[Math.floor(Math.random() * staff.length)];
            const pm = staff[Math.floor(Math.random() * staff.length)];

            const statuses = ['GREEN', 'AMBER', 'RED'];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

            const serviceTypes = ['MSS', 'ITO', 'MEA'];
            const randomService = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];

            await prisma.client.create({
                data: {
                    name: clientName,
                    tenantId,
                    status: randomStatus,
                    departmentId: owner.departmentId,
                    ownerId: owner.id,
                    accountableId: accountable.id,
                    csmName: csm.name,
                    pmName: pm.name,
                    serviceType: randomService,
                    engagementStatus: 'ONGOING',
                    lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)) // Random date in past 3 months
                }
            });
            generatedClientCount++;
        }
    }

    console.log(`✅ Generated ${generatedClientCount} clients.`);

    console.log('Seeding completed successfully! 🎉');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
