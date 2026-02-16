// database/import-clients.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface CSVRow {
    'Company Name': string;
    'CS': string;
    'PM/SDM': string;
    'Resource': string;
    'vCISO': string;
    'Service Type': string;
    'Current Engagement': string;
    'RAG Status Internal (based on CS and PM)': string;
    'Next Steps/AIs (Based on CS and PM)': string;
    'Comments (CS/PM)': string;
    'Comments (Vipin/Sam/Robin/Perley/Naveen)\n': string;
    'Accountability(PM/Vertical Head)': string;
    'Status (Open/On-going)': string;
}

async function parseCSV(filePath: string): Promise<CSVRow[]> {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    // Simple CSV parser (handles basic quoted fields)
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows: CSVRow[] = [];

    // Start from line 1, but skip if it looks like a continuation of headers
    let startLine = 1;
    if (lines[1] && lines[1].includes('Accountability')) {
        startLine = 2; // Skip the header continuation line
    }

    for (let i = startLine; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: any = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        // Only add if it has a valid company name in the first column
        if (row['Company Name'] && row['Company Name'].trim() && !row['Company Name'].includes('Accountability')) {
            rows.push(row as CSVRow);
        }
    }

    return rows;
}

function mapRAGStatus(ragString: string): 'RED' | 'AMBER' | 'GREEN' | 'UNKNOWN' {
    const lower = ragString.toLowerCase().trim();
    if (lower === 'red') return 'RED';
    if (lower === 'amber' || lower === 'yellow') return 'AMBER';
    if (lower === 'green') return 'GREEN';
    return 'UNKNOWN';
}

function mapStatus(statusString: string): 'OPEN' | 'ONGOING' | 'CLOSED' {
    if (!statusString) return 'OPEN'; // Default if undefined or empty
    const lower = statusString.toLowerCase().trim();
    if (lower.includes('ongoing') || lower.includes('on going') || lower.includes('on-going')) return 'ONGOING';
    if (lower.includes('closed')) return 'CLOSED';
    return 'OPEN';
}

async function findOrCreateDepartment(serviceType: string) {
    if (!serviceType || serviceType === '-') return null;

    // Map service types to departments
    const deptMap: { [key: string]: string } = {
        'MEA': 'MEA',
        'MSS': 'MSS',
        'MIS': 'MIS',
        'ITO': 'ITO',
        'QL': 'QL'
    };

    const deptName = deptMap[serviceType.toUpperCase().trim()];
    if (!deptName) return null;

    const dept = await prisma.department.findFirst({
        where: { name: deptName }
    });

    return dept?.id || null;
}

async function importClients() {
    console.log('🚀 Starting client import from CSV...');

    const csvPath = path.join(__dirname, 'data.csv');
    const rows = await parseCSV(csvPath);

    console.log(`📊 Found ${rows.length} rows in CSV`);

    let imported = 0;
    let skipped = 0;

    for (const row of rows) {
        const companyName = row['Company Name']?.trim();

        // Skip empty rows
        if (!companyName) {
            skipped++;
            continue;
        }

        try {
            // Check if client already exists
            const existing = await prisma.client.findFirst({
                where: {
                    name: companyName,
                    deletedAt: null
                }
            });

            if (existing) {
                console.log(`⏭️  Skipping ${companyName} - already exists`);
                skipped++;
                continue;
            }

            const departmentId = await findOrCreateDepartment(row['Service Type']);

            // Find users for linking
            const findUserByName = async (name: string | null) => {
                if (!name) return null;
                const user = await prisma.user.findFirst({
                    where: { name: { contains: name.trim() } }
                });
                return user?.id || null;
            };

            const ownerId = await findUserByName(row['CS']);
            const accountableId = await findUserByName(row['Accountability(PM/Vertical Head)']);

            // Create client
            await prisma.client.create({
                data: {
                    name: companyName,
                    serviceType: row['Service Type']?.trim() || null,
                    currentEngagement: row['Current Engagement']?.trim() || null,
                    engagementStatus: mapStatus(row['Status (Open/On-going)']),
                    status: mapRAGStatus(row['RAG Status Internal (based on CS and PM)']),
                    nextSteps: row['Next Steps/AIs (Based on CS and PM)']?.trim() || null,
                    csmPmComments: row['Comments (CS/PM)']?.trim() || null,
                    executiveComments: row['Comments (Vipin/Sam/Robin/Perley/Naveen)\n']?.trim() || null,
                    csmName: row['CS']?.trim() || null,
                    pmName: row['PM/SDM']?.trim() || null,
                    amName: row['Accountability(PM/Vertical Head)']?.trim() || null,
                    vcisoName: row['vCISO']?.trim() || null,
                    departmentId: departmentId ?? undefined,
                    ownerId: ownerId ?? undefined,
                    accountableId: accountableId ?? undefined,
                }
            });

            console.log(`✅ Imported: ${companyName}`);
            imported++;
        } catch (error) {
            console.error(`❌ Error importing ${companyName}:`, error);
            skipped++;
        }
    }

    console.log(`\n✨ Import complete!`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${rows.length}`);
}

importClients()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
