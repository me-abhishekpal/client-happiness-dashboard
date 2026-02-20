'use server';

import { prisma } from '@/lib/prisma-tenant';
import { getTenantId } from '@/lib/tenant-context';
import { getCurrentUser } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import speakeasy from 'speakeasy';

// ─── Helper ────────────────────────────────────────────────────────────────

async function verifyMfa(mfaCode: string): Promise<void> {
    const user = await getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    // Look up mfaSecret from DB (session/JWT doesn't carry it)
    const dbUser = await (prisma as any).user.findFirst({ where: { id: user.id } });

    // If MFA hasn't been configured yet, skip verification (graceful degradation)
    if (!dbUser?.mfaSecret) return;

    const valid = speakeasy.totp.verify({
        secret: dbUser.mfaSecret,
        encoding: 'base32',
        token: mfaCode,
        window: 1,
    });
    if (!valid) throw new Error('Invalid MFA code. Please try again.');
}

// ─── Services ───────────────────────────────────────────────────────────────

export async function createService(formData: FormData) {
    const tenantId = await getTenantId();
    if (!tenantId) throw new Error('No tenant context');

    const name = (formData.get('name') as string).trim();
    if (!name) throw new Error('Service name is required');

    await prisma.service.create({ data: { name, tenantId } });
    revalidatePath('/contracts');
}

export async function updateService(formData: FormData) {
    const tenantId = await getTenantId();
    if (!tenantId) throw new Error('No tenant context');

    const id = formData.get('id') as string;
    const name = (formData.get('name') as string).trim();
    if (!name) throw new Error('Service name is required');

    await prisma.service.update({ where: { id }, data: { name } });
    revalidatePath('/contracts');
}

export async function deleteService(formData: FormData) {
    const tenantId = await getTenantId();
    if (!tenantId) throw new Error('No tenant context');

    const id = formData.get('id') as string;
    const mfaCode = formData.get('mfaCode') as string;
    await verifyMfa(mfaCode);

    // Unlink clients before deleting
    await prisma.client.updateMany({ where: { serviceId: id, tenantId }, data: { serviceId: null } });
    await prisma.service.delete({ where: { id } });
    revalidatePath('/contracts');
}

// ─── Engagements ─────────────────────────────────────────────────────────────

export async function createEngagement(formData: FormData) {
    const tenantId = await getTenantId();
    if (!tenantId) throw new Error('No tenant context');

    const name = (formData.get('name') as string).trim();
    // Multiple service IDs from multiselect (same field name repeated)
    const serviceIds = formData.getAll('serviceIds') as string[];
    if (!name) throw new Error('Engagement name is required');

    await prisma.engagement.create({
        data: {
            name,
            tenantId,
            services: serviceIds.length > 0
                ? { connect: serviceIds.map(id => ({ id })) }
                : undefined,
        },
    });
    revalidatePath('/contracts');
}

export async function updateEngagement(formData: FormData) {
    const tenantId = await getTenantId();
    if (!tenantId) throw new Error('No tenant context');

    const id = formData.get('id') as string;
    const name = (formData.get('name') as string).trim();
    const serviceIds = formData.getAll('serviceIds') as string[];
    if (!name) throw new Error('Engagement name is required');

    await prisma.engagement.update({
        where: { id },
        data: {
            name,
            // `set` replaces the entire M2M relation list
            services: { set: serviceIds.map(svcId => ({ id: svcId })) },
        },
    });
    revalidatePath('/contracts');
}

export async function deleteEngagement(formData: FormData) {
    const tenantId = await getTenantId();
    if (!tenantId) throw new Error('No tenant context');

    const id = formData.get('id') as string;
    const mfaCode = formData.get('mfaCode') as string;
    await verifyMfa(mfaCode);

    // Unlink clients first, then delete (M2M junction entries auto-removed by Prisma)
    await prisma.client.updateMany({ where: { engagementId: id, tenantId }, data: { engagementId: null } });
    await prisma.engagement.delete({ where: { id } });
    revalidatePath('/contracts');
}
