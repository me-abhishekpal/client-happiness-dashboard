'use server';
// FIX_MARKER_V1

import { getTenantId } from '@/lib/tenant-context';
import { prisma } from '@/lib/prisma-tenant';
import { requirePermission } from '@/lib/rbac';

export async function exportClientsToCSV(statusFilter?: string) {
    await requirePermission('clients:view');
    const tenantId = await getTenantId();
    if (!tenantId) throw new Error("No tenant context");

    const clients = await prisma.client.findMany({
        where: {
            deletedAt: null,
            ...(statusFilter ? { status: statusFilter } : {})
        },
        include: {
            owner: true,
            accountable: true,
            department: true,
            service: true,
            currentEngagement: true,
            csm: true,
            pm: true,
            am: true,
            vciso: true
        },
        orderBy: { name: 'asc' }
    });

    // CSV headers
    const headers = [
        'Client Name',
        'Status',
        'On Watchlist',
        'Department',
        'Owner',
        'Accountable',
        'Service Type',
        'Current Engagement',
        'Engagement Status',
        'CSM Name',
        'PM Name',
        'AM Name',
        'vCISO Name',
        'Resource Link',
        'Next Steps',
        'CSM/PM Comments',
        'Executive Comments',
        'Last Updated',
        'Created At'
    ];

    // Escape CSV field
    const escapeCSV = (field: any): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        if (str.includes(',') || str.includes('\n') || str.includes('"')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    // Generate CSV rows
    const rows = clients.map(client => [
        escapeCSV(client.name),
        escapeCSV(client.status),
        escapeCSV(client.isOnWatchlist ? 'Yes' : 'No'),
        escapeCSV(client.department?.name || ''),
        escapeCSV(client.owner?.name || ''),
        escapeCSV(client.accountable?.name || ''),
        escapeCSV(client.service?.name || ''),
        escapeCSV(client.currentEngagement?.name || ''),
        escapeCSV(client.engagementStatus || ''),
        escapeCSV(client.csm?.name || ''),
        escapeCSV(client.pm?.name || ''),
        escapeCSV(client.am?.name || ''),
        escapeCSV(client.vciso?.name || ''),
        escapeCSV(client.resourceLink || ''),
        escapeCSV(client.nextSteps || ''),
        escapeCSV(client.csmPmComments || ''),
        escapeCSV(client.executiveComments || ''),
        escapeCSV(client.lastUpdated.toLocaleString()),
        escapeCSV(client.createdAt.toLocaleString())
    ].join(','));

    // Combine headers and rows
    const csv = [headers.join(','), ...rows].join('\n');

    return csv;
}
