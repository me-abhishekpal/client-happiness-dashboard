// database/import-clients.js
const { PrismaClient } = require('../frontend/node_modules/.prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

function parseCSV(fileContent) {
    const rows = [];
    let currentField = '';
    let inQuotes = false;
    let fields = [];

    for (let i = 0; i < fileContent.length; i++) {
        const char = fileContent[i];
        const nextChar = fileContent[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            currentField += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            fields.push(currentField.trim());
            currentField = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (currentField !== '' || fields.length > 0) {
                fields.push(currentField.trim());
                rows.push(fields);
                fields = [];
                currentField = '';
            }
            if (char === '\r' && nextChar === '\n') i++;
        } else {
            currentField += char;
        }
    }
    if (currentField !== '' || fields.length > 0) {
        fields.push(currentField.trim());
        rows.push(fields);
    }
    return rows;
}

function mapRAGStatus(ragString) {
    const lower = (ragString || '').toLowerCase().trim();
    if (lower === 'red') return 'CRITICAL';
    if (lower === 'amber' || lower === 'yellow') return 'AT_RISK';
    if (lower === 'green') return 'HEALTHY';
    return 'HEALTHY';
}

function mapStatus(statusString) {
    if (!statusString) return 'OPEN';
    const lower = statusString.toLowerCase().trim();
    if (lower.includes('ongoing') || lower.includes('on going') || lower.includes('on-going')) return 'ONGOING';
    if (lower.includes('closed')) return 'CLOSED';
    return 'OPEN';
}

async function findOrCreateDepartment(serviceType) {
    if (!serviceType || serviceType === '-' || serviceType.length > 10) return null;

    const deptMap = { 'MEA': 'MEA', 'MSS': 'MSS', 'MIS': 'MIS', 'ITO': 'ITO', 'QL': 'QL' };
    const deptName = deptMap[serviceType.toUpperCase().trim()];
    if (!deptName) return null;

    let dept = await prisma.department.findUnique({ where: { id: deptName } });
    if (!dept) {
        dept = await prisma.department.create({ data: { id: deptName, name: deptName } });
    }
    return dept.id;
}

async function importClients() {
    console.log('🚀 Starting robust client import from CSV...');
    const csvPath = path.join(__dirname, 'data.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const allRows = parseCSV(fileContent);
    const headers = allRows[0];
    const dataRows = allRows.slice(1);

    console.log(`📊 Found ${dataRows.length} records in CSV`);

    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!adminUser) { console.error('❌ Admin user not found'); process.exit(1); }

    let imported = 0;
    let updated = 0;
    let skipped = 0;

    for (const row of dataRows) {
        const record = {};
        headers.forEach((h, i) => record[h] = row[i]);

        const companyName = record['Company Name']?.trim();
        if (!companyName || companyName.includes('Accountability')) {
            skipped++;
            continue;
        }

        try {
            const departmentId = await findOrCreateDepartment(record['Service Type']);
            const clientData = {
                name: companyName,
                serviceType: record['Service Type'] || null,
                currentEngagement: record['Current Engagement'] || null,
                engagementStatus: mapStatus(record['Status (Open/On-going)']),
                status: mapRAGStatus(record['RAG Status Internal (based on CS and PM)']),
                nextSteps: record['Next Steps/AIs (Based on CS and PM)'] || null,
                csmPmComments: record['Comments (CS/PM)'] || null,
                executiveComments: record['Comments (Vipin/Sam/Robin/Perley/Naveen)\n'] || record['Comments (Vipin/Sam/Robin/Perley/Naveen)'] || null,
                csmName: record['CS'] || null,
                pmName: record['PM/SDM'] || null,
                amName: record['Accountability(PM/Vertical Head)'] || null,
                vcisoName: record['vCISO'] || null,
                departmentId: departmentId,
                ownerId: adminUser.id,
                lastUpdated: new Date()
            };

            const existing = await prisma.client.findFirst({ where: { name: companyName, deletedAt: null } });
            if (existing) {
                await prisma.client.update({ where: { id: existing.id }, data: clientData });
                updated++;
            } else {
                await prisma.client.create({ data: clientData });
                imported++;
            }
        } catch (error) {
            console.error(`❌ Error with ${companyName}:`, error.message);
            skipped++;
        }
    }
    console.log(`\n✨ Import complete! Imported: ${imported}, Updated: ${updated}, Skipped: ${skipped}`);
}

importClients().catch(console.error).finally(() => prisma.$disconnect());
