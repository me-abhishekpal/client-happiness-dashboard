// database/import-clients.js
const { PrismaClient } = require('../frontend/node_modules/.prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function parseCSV(filePath) {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim());

    const parseCSVLine = (line) => {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^"|"$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/^"|"$/g, ''));
        return result;
    };

    const headers = parseCSVLine(lines[0]);
    const rows = [];

    let startLine = 1;
    if (lines[1] && lines[1].includes('Accountability')) {
        startLine = 2;
    }

    for (let i = startLine; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};

        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });

        if (row['Company Name'] && row['Company Name'].trim() && !row['Company Name'].includes('Accountability')) {
            rows.push(row);
        }
    }

    return rows;
}

function mapRAGStatus(ragString) {
    const lower = ragString.toLowerCase().trim();
    if (lower === 'red') return 'CRITICAL';
    if (lower === 'amber' || lower === 'yellow') return 'AT_RISK';
    if (lower === 'green') return 'HEALTHY';
    return 'AT_RISK';
}

function mapStatus(statusString) {
    if (!statusString) return 'OPEN';
    const lower = statusString.toLowerCase().trim();
    if (lower.includes('ongoing') || lower.includes('on going') || lower.includes('on-going')) return 'ONGOING';
    if (lower.includes('closed')) return 'CLOSED';
    return 'OPEN';
}

async function findOrCreateDepartment(serviceType) {
    if (!serviceType || serviceType === '-') return null;

    const deptMap = {
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

    if (!dept && deptName) {
        return (await prisma.department.create({
            data: { id: deptName, name: deptName }
        })).id;
    }

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

        if (!companyName) {
            skipped++;
            continue;
        }

        try {
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

            const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });

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
                    departmentId: departmentId || undefined,
                    ownerId: adminUser?.id,
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
