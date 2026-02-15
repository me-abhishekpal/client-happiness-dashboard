// prisma/import-csv.ts
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

const prisma = new PrismaClient();

async function main() {
  const csvPath = path.join(process.cwd(), 'data.csv');
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Use csv-parse library for robust parsing
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true
  });
  
  console.log(`Found ${records.length} records to process.`);

  for (const record of records) {
    const companyName = record['Company Name']?.trim();
    if (!companyName) continue;

    const csName = record['CS']?.trim();
    const serviceType = record['Service Type']?.trim();
    const ragRaw = record['RAG Status Internal (based on CS and PM)']?.trim();
    const accountabilityName = record['Accountability(PM/Vertical Head)']?.trim();
    const comments = record['Comments (CS/PM)']?.trim();

    // 1. Find/Create Owner (CS)
    let ownerId;
    if (csName) {
      const email = `${csName.toLowerCase().replace(/\s/g, '.')}@example.com`;
      const owner = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: csName,
          role: 'MANAGER',
          title: 'CS Manager'
        }
      });
      ownerId = owner.id;
    } else {
      // Default to admin
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      ownerId = admin?.id!;
    }

    // 2. Find/Create Accountability Person
    let accountableId = null;
    if (accountabilityName) {
      const email = `${accountabilityName.toLowerCase().replace(/\s/g, '.')}@example.com`;
      const acc = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: accountabilityName,
          role: 'EXECUTIVE',
          title: 'Accountable Lead'
        }
      });
      accountableId = acc.id;
    }

    // 3. Map Department
    let deptId = 'MIS'; // Default
    const serviceLower = serviceType?.toLowerCase() || '';
    if (serviceLower.includes('mss')) deptId = 'MSS';
    else if (serviceLower.includes('mea')) deptId = 'MEA';
    else if (serviceLower.includes('ito')) deptId = 'MIS';

    // 4. Map Status
    let status = 'UNKNOWN';
    const ragLower = ragRaw?.toLowerCase() || '';
    if (ragLower.includes('red')) status = 'RED';
    else if (ragLower.includes('amber')) status = 'AMBER';
    else if (ragLower.includes('green')) status = 'GREEN';

    // 5. Create Client
    try {
      await prisma.client.upsert({
        where: { id: companyName }, // Use name as ID
        update: {
          status,
          ownerId,
          accountableId,
          departmentId: deptId,
          serviceType: serviceType || 'Unknown',
          currentEngagement: record['Current Engagement'] || ''
        },
        create: {
          id: companyName,
          name: companyName,
          status,
          ownerId,
          accountableId,
          departmentId: deptId,
          serviceType: serviceType || 'Unknown',
          currentEngagement: record['Current Engagement'] || ''
        }
      });
      console.log(`Imported: ${companyName} -> ${status}`);
    } catch (e) {
      console.error(`Failed to import ${companyName}:`, e);
    }
  }
}

main()
  .then(() => console.log('Import done! 🌿'))
  .catch(console.error);
