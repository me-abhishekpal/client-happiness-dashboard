// database/migrate-to-multi-tenant.ts
// This script migrates existing data to the multi-tenant architecture

import * as dotenv from 'dotenv';
import * as path from 'path';
import { PrismaClient } from '../frontend/node_modules/.prisma/client';

// Load environment variables from the current directory (project root)
dotenv.config({ path: path.join(process.cwd(), '.env') });

const prisma = new PrismaClient();

const DEFAULT_TENANT_ID = 'default-tenant-cuid';
const DEFAULT_TENANT_DATA = {
    id: DEFAULT_TENANT_ID,
    slug: 'default',
    name: 'Abhee Organization',
    subdomain: 'app',
    domainVerified: true,
    allowedEmailDomain: 'abhee.org',
    plan: 'enterprise',
    status: 'active'
};

async function migrateToMultiTenant() {
    console.log('🚀 Starting multi-tenant migration...\n');

    try {
        // Step 1: Create default tenant
        console.log('📝 Creating default tenant...');
        const tenant = await prisma.tenant.upsert({
            where: { id: DEFAULT_TENANT_ID },
            update: {
                name: 'Abhee Organization',
                allowedEmailDomain: 'abhee.org'
            },
            create: DEFAULT_TENANT_DATA
        });
        console.log(`✅ Default tenant created/updated: ${tenant.name} (${tenant.slug})\n`);

        // Step 2-9: Migrate all models using Prisma methods
        const models = [
            { name: 'user', emoji: '👥' },
            { name: 'client', emoji: '🏢' },
            { name: 'role', emoji: '🔑' },
            { name: 'title', emoji: '💼' },
            { name: 'department', emoji: '🏬' },
            { name: 'file', emoji: '📄' },
            { name: 'escalation', emoji: '🚨' },
            { name: 'statusUpdate', emoji: '📊' }
        ];

        for (const model of models) {
            console.log(`${model.emoji} Migrating ${model.name}s...`);

            // @ts-ignore - Dynamic access to prisma models
            const count = await prisma[model.name].count({
                where: { OR: [{ tenantId: null }, { tenantId: '' }] }
            });

            if (count > 0) {
                // @ts-ignore
                const result = await prisma[model.name].updateMany({
                    where: { OR: [{ tenantId: null }, { tenantId: '' }] },
                    data: { tenantId: DEFAULT_TENANT_ID }
                });
                console.log(`✅ Migrated: ${result.count} rows updated\n`);
            } else {
                console.log(`ℹ️ No rows needing migration found for ${model.name}\n`);
            }
        }

        console.log('✅ Multi-tenant migration completed successfully!');
        console.log(`\n🎉 All data is now associated with tenant: ${tenant.name}`);
        console.log(`📧 Email domain restriction: @${tenant.allowedEmailDomain}`);
        console.log(`🌐 Accessible at: app-rag.abhee.org\n`);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateToMultiTenant()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
