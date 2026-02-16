// database/link-clients-to-users.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
    'Company Name': string;
    'CS': string;
    'Accountability(PM/Vertical Head)': string;
}

async function parseCSV(filePath: string): Promise<CSVRow[]> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else current += char;
        }
        result.push(current.trim());
        return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows: CSVRow[] = [];

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: any = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        if (row['Company Name'] && row['Company Name'].trim() && !row['Company Name'].includes('Accountability')) {
            rows.push(row as CSVRow);
        }
    }

    return rows;
}

async function linkClientsToUsers() {
    console.log('🔗 Starting client-user linking...');
    const csvPath = path.join(__dirname, 'data.csv');
    const rows = await parseCSV(csvPath);

    console.log(`📊 Found ${rows.length} rows in CSV`);

    let updated = 0;
    let skipped = 0;

    for (const row of rows) {
        const companyName = row['Company Name']?.trim();
        if (!companyName) {
            skipped++;
            continue;
        }

        try {
            // Find the client
            const client = await prisma.client.findFirst({
                where: {
                    name: companyName,
                    deletedAt: null
                }
            });

            if (!client) {
                console.log(`⏭️  Client not found: ${companyName}`);
                skipped++;
                continue;
            }

            // Find users
            const findUserByName = async (name: string | null) => {
                if (!name || name === '-') return null;
                const user = await prisma.user.findFirst({
                    where: { name: { contains: name.trim() } }
                });
                return user?.id || null;
            };

            const ownerId = await findUserByName(row['CS']);
            const accountableId = await findUserByName(row['Accountability(PM/Vertical Head)']);

            // Update client with user links
            await prisma.client.update({
                where: { id: client.id },
                data: {
                    ownerId: ownerId ?? undefined,
                    accountableId: accountableId ?? undefined,
                }
            });

            console.log(`✅ Linked: ${companyName} (Owner: ${row['CS'] || 'none'}, Accountable: ${row['Accountability(PM/Vertical Head)'] || 'none'})`);
            updated++;
        } catch (error) {
            console.error(`❌ Error linking ${companyName}:`, error);
            skipped++;
        }
    }

    console.log(`\n✨ Linking complete!`);
    console.log(`   Updated: ${updated}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${rows.length}`);
}

linkClientsToUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
