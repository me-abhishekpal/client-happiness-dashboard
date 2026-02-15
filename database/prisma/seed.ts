// prisma/seed.ts
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // 1. Create Departments
  const depts = [
    { name: 'MIS' },
    { name: 'MSS' },
    { name: 'MEA' },
    { name: 'PMO' },
    { name: 'CS' },
    { name: 'AM' },
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

  // 2. Create Admin User (You)
  const admin = await prisma.user.upsert({
    where: { email: 'abhee@example.com' }, // Replace with your actual email later
    update: {},
    create: {
      email: 'abhee@example.com',
      name: 'Abhee',
      role: 'ADMIN',
      title: 'System Architect',
      departmentId: 'PMO',
    },
  });

  // 3. Create Executives
  const execs = [
    { email: 'vipin@example.com', name: 'Vipin', title: 'Executive' },
    { email: 'aj@example.com', name: 'AJ', title: 'Executive' },
    { email: 'jim@example.com', name: 'Jim', title: 'Executive' },
  ];

  for (const exec of execs) {
    await prisma.user.upsert({
      where: { email: exec.email },
      update: {},
      create: {
        email: exec.email,
        name: exec.name,
        role: 'EXECUTIVE',
        title: exec.title,
      },
    });
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
