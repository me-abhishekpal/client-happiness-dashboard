// prisma/seed.ts
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 0. Define Roles & Permissions
  const roles = [
    {
      name: 'ADMIN',
      description: 'Full access to everything',
      permissions: JSON.stringify(['*'])
    },
    {
      name: 'EXECUTIVE',
      description: 'View dashboard and clients details',
      permissions: JSON.stringify(['dashboard', 'clients_read', 'reports'])
    },
    {
      name: 'MANAGER',
      description: 'Manage clients and view dashboard',
      permissions: JSON.stringify(['dashboard', 'clients_read', 'clients_write'])
    },
    {
      name: 'VIEWER',
      description: 'Read-only access',
      permissions: JSON.stringify(['dashboard'])
    }
  ];

  console.log('🌱 Seeding Roles...');
  for (const r of roles) {
    await prisma.role.upsert({
      where: { name: r.name },
      update: { permissions: r.permissions, description: r.description },
      create: r
    });
  }

  // 1. Create Departments
  const depts = [
    { name: 'MIS' },
    { name: 'MSS' },
    { name: 'MEA' },
    { name: 'ITO' },
  ];

  for (const dept of depts) {
    await prisma.department.upsert({
      where: { id: dept.name }, // Hack for unique seeding
      update: {},
      create: {
        id: dept.name,
        name: dept.name,
      },
    });
  }

  // 2. Create Titles
  // We must create them in order or handle dependencies. 
  // For simplicity, we create them one by one to ensure parents exist.

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
      const parent = await prisma.title.findUnique({ where: { name: title.reportsTo } });
      reportsToId = parent?.id;
    }

    await prisma.title.upsert({
      where: { name: title.name },
      update: { reportsToId },
      create: { name: title.name, reportsToId }
    });
  }

  // Helper to get role ID
  const getRoleId = async (name: string) => {
    const role = await prisma.role.findUnique({ where: { name } });
    return role?.id;
  }

  const adminRole = await getRoleId('ADMIN');
  const execRole = await getRoleId('EXECUTIVE');

  // 2. Create Admin User (You)
  const admin = await prisma.user.upsert({
    where: { email: 'abhee@example.com' }, // Replace with your actual email later
    update: { roleId: adminRole }, // Update existing to have role link
    create: {
      email: 'abhee@example.com',
      name: 'Abhee',
      role: 'ADMIN',
      roleId: adminRole,
      title: 'System Architect',
      departmentId: 'PMO',
    },
  });

  // 3. Create Executives
  const execs = [
    { email: 'vipin@example.com', name: 'Vipin', title: 'Executive' },
    { email: 'aj@example.com', name: 'AJ', title: 'Executive' },
    { email: 'jim@example.com', name: 'Jim', title: 'Executive' },
    // CSMs and PMs
    { email: 'alex@example.com', name: 'Alex Morgan', title: 'Customer Success Manager' },
    { email: 'sarah@example.com', name: 'Sarah Connor', title: 'Project Manager' },
    { email: 'mike@example.com', name: 'Mike Ross', title: 'Technical Project Manager' },
  ];

  for (const exec of execs) {
    await prisma.user.upsert({
      where: { email: exec.email },
      update: { roleId: execRole },
      create: {
        email: exec.email,
        name: exec.name,
        role: 'EXECUTIVE',
        roleId: execRole,
        title: exec.title,
      },
    });
  }

  // 4. Migrate any other existing users who lack roleId
  console.log('🔄 Migrating existing users...');
  const usersToMigrate = await prisma.user.findMany({ where: { roleId: null } });
  for (const user of usersToMigrate) {
    // Default to VIEWER if role string doesn't match standard or map manually
    let targetRole = 'VIEWER';
    if (['ADMIN', 'MANAGER', 'EXECUTIVE'].includes(user.role)) {
      targetRole = user.role;
    }
    const rId = await getRoleId(targetRole);
    if (rId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { roleId: rId }
      });
    }
  }

  // 5. Seed Clients
  console.log('🌱 Seeding Clients...');
  const clients = [
    { name: 'Acme Corp', serviceType: 'MSS', status: 'GREEN' },
    { name: 'Globex Inc', serviceType: 'ITO', status: 'AMBER' },
    { name: 'Soylent Corp', serviceType: 'MEA', status: 'RED' }
  ];

  const pmoDept = await prisma.department.findFirst({ where: { name: 'PMO' } });

  if (pmoDept && admin) {
    for (const c of clients) {
      // Check if exists by name to avoid duplicates
      const existing = await prisma.client.findFirst({ where: { name: c.name } });
      if (!existing) {
        await prisma.client.create({
          data: {
            name: c.name,
            serviceType: c.serviceType,
            status: c.status,
            ownerId: admin.id,
            departmentId: pmoDept.id,
            lastUpdated: new Date()
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
