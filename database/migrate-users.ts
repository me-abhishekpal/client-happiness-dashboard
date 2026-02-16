// database/migrate-users.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function parseCSV(filePath: string): Promise<string[]> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    // Simple CSV parser for headers
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
    const names = new Set<string>();

    // Identify columns for CSM, PM, AM, vCISO
    const columns = [
        'CS',
        'PM/SDM',
        'vCISO',
        'Accountability(PM/Vertical Head)'
    ];

    const indices = columns.map(col => headers.indexOf(col)).filter(idx => idx !== -1);

    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        indices.forEach(idx => {
            const name = values[idx]?.trim();
            if (name && name !== '-' && name !== 'Accountability') {
                // Split multi-names if necessary
                if (name.includes('/')) {
                    name.split('/').forEach(n => names.add(n.trim()));
                } else if (name.includes(',')) {
                    name.split(',').forEach(n => names.add(n.trim()));
                } else {
                    names.add(name);
                }
            }
        });
    }

    return Array.from(names);
}

async function migrateUsers() {
    console.log('🚀 Starting user migration from CSV...');
    const csvPath = path.join(__dirname, 'data.csv');
    const uniqueNames = await parseCSV(csvPath);

    console.log(`📊 Found ${uniqueNames.length} unique names in CSV`);

    let imported = 0;

    for (const name of uniqueNames) {
        const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@example.com`;

        try {
            await prisma.user.upsert({
                where: { email },
                update: { name },
                create: {
                    email,
                    name,
                    role: 'MANAGER',
                    title: 'System Personnel'
                }
            });
            console.log(`✅ User created/updated: ${name} (${email})`);
            imported++;
        } catch (error) {
            console.error(`❌ Error migrating user ${name}:`, error);
        }
    }

    console.log(`\n✨ User migration complete! (${imported} users processed)`);
}

migrateUsers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
