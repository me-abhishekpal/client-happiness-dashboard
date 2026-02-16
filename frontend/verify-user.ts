const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        include: { roleRel: true }
    });
    console.log('--- USERS ---');
    users.forEach(u => {
        console.log(`User: ${u.email}, Role(String): ${u.role}, RoleRel: ${u.roleRel?.name}, Permissions: ${u.roleRel?.permissions}`);
    });

    const roles = await prisma.role.findMany();
    console.log('--- ROLES ---');
    console.log(JSON.stringify(roles, null, 2));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
