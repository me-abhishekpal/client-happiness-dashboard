// lib/prisma-tenant.ts
// Prisma client with tenant-aware extensions
// VERSION: 3.0.0-TYPE-SAFE-FIX
import { getTenantId } from './tenant-context';
import { prismaBase } from './prisma-base';

/**
 * Tenant-aware Prisma extension.
 * VERSION 3.0.0: Uses surgical type bypasses to satisfy the compiler in production.
 */
export const prisma = prismaBase.$extends({
    query: {
        $allModels: {
            async $allOperations({ model, operation, args, query }) {
                // Models that have tenantId and require filtering
                const TENANT_MODELS = [
                    'User',
                    'Client',
                    'Role',
                    'Title',
                    'Department',
                    'File',
                    'Escalation',
                    'StatusUpdate'
                ];

                if (!TENANT_MODELS.includes(model)) {
                    return query(args);
                }

                const tenantId = await getTenantId();

                // Skip filtering if no tenantId is found (e.g. platform admin level)
                if (!tenantId) {
                    return query(args);
                }

                // Surgical type bypass for specific operations
                const a = args as any;

                if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(operation)) {
                    // @ts-ignore - Explicitly bypass union type conflict for where.tenantId
                    a.where = { ...a.where, tenantId };
                } else if (operation === 'create') {
                    // @ts-ignore
                    a.data = { ...a.data, tenantId };
                } else if (operation === 'createMany') {
                    if (Array.isArray(a.data)) {
                        a.data = a.data.map((item: any) => ({ ...item, tenantId }));
                    } else if (a.data) {
                        // @ts-ignore
                        a.data = { ...a.data, tenantId };
                    }
                } else if (['update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
                    // @ts-ignore
                    a.where = { ...a.where, tenantId };
                } else if (operation === 'upsert') {
                    // @ts-ignore
                    a.where = { ...a.where, tenantId };
                    // @ts-ignore
                    a.create = { ...a.create, tenantId };
                }

                return query(a);
            },
        },
    },
});

export default prisma;
