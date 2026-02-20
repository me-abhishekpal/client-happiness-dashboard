import { prisma } from '@/lib/prisma-tenant';
import { getTenantId } from '@/lib/tenant-context';
import { ContractsManager } from '@/components/ContractsManager';
import {
    createService, updateService, deleteService,
    createEngagement, updateEngagement, deleteEngagement,
} from '@/app/actions/contracts';

export const dynamic = 'force-dynamic';

export default async function ContractsPage() {
    const tenantId = await getTenantId();
    if (!tenantId) return <div>No tenant context</div>;

    const [services, engagements] = await Promise.all([
        prisma.service.findMany({ orderBy: { name: 'asc' } }),
        prisma.engagement.findMany({
            orderBy: { name: 'asc' },
            include: { services: true },
        }),
    ]);

    return (
        <ContractsManager
            services={services}
            engagements={engagements as any}
            actions={{ createService, updateService, deleteService, createEngagement, updateEngagement, deleteEngagement }}
        />
    );
}
