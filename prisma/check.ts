// prisma/check.ts
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const userCount = await prisma.user.count();
  const deptCount = await prisma.department.count();
  console.log(`Users: ${userCount}, Departments: ${deptCount}`);
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
