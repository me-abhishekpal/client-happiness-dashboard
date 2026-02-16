
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning up bad clients...');

    // Fetch all clients
    const clients = await prisma.client.findMany();

    let deletedCount = 0;

    for (const client of clients) {
        if (client.id.includes(' ') || /^\d+\./.test(client.id)) {
            console.log(`Deleting client with bad ID: "${client.id}" - Name: ${client.name}`);
            try {
                await prisma.client.delete({
                    where: { id: client.id }
                });
                deletedCount++;
                console.log(`Deleted client: ${client.name}`);
            } catch (e) {
                console.error(`Failed to delete ${client.id}:`, e);
            }
        }
    }

    console.log(`✨ Deleted ${deletedCount} clients with invalid IDs.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
