// prisma/check-emails.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('--- Users in Database ---');
  users.forEach(u => console.log(`${u.name}: ${u.email} (${u.role})`));
  
  const client = await prisma.client.findFirst({ include: { owner: true, accountable: true } });
  console.log('\n--- Sample Client ---');
  if (client) {
    console.log(`Client: ${client.name}`);
    console.log(`Owner Email: ${client.owner?.email}`);
    console.log(`Accountable Email: ${client.accountable?.email}`);
  } else {
    console.log('No clients found.');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(console.error);
