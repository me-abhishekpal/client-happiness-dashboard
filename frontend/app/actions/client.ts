'use server';
// FIX_MARKER_V1

import { getTenantId } from '@/lib/tenant-context';
import { prisma } from '@/lib/prisma-tenant';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/rbac';
import { getCurrentUser } from '@/lib/session';
import speakeasy from 'speakeasy';


export async function createClient(formData: FormData) {
  await requirePermission('clients:edit');
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("No tenant context");

  const name = formData.get('name') as string;
  const serviceId = formData.get('serviceId') as string || null;
  const departmentId = formData.get('departmentId') as string;
  const ownerId = formData.get('ownerId') as string;
  const accountableId = formData.get('accountableId') as string || null;
  const engagementId = formData.get('engagementId') as string || null;
  const engagementStatus = formData.get('engagementStatus') as string;
  const revenueStr = formData.get('revenue') as string;
  const revenue = revenueStr ? parseFloat(revenueStr) : null;
  const csmId = formData.get('csmId') as string || null;
  const pmId = formData.get('pmId') as string || null;
  const vcisoId = formData.get('vcisoId') as string || null;
  const nextSteps = formData.get('nextSteps') as string;
  const csmPmComments = formData.get('csmPmComments') as string;
  const executiveComments = formData.get('executiveComments') as string;

  const newClient = await prisma.client.create({
    data: {
      name,
      serviceId,
      departmentId,
      ownerId,
      accountableId,
      status: 'UNKNOWN',
      engagementId,
      engagementStatus,
      revenue,
      csmId,
      pmId,
      vcisoId,
      nextSteps,
      csmPmComments,
      executiveComments,
      tenantId: tenantId!
    } as any
  });
  revalidatePath('/clients');
  revalidatePath('/admin/clients');
  redirect(`/clients/${newClient.id}`);
}

export async function updateClient(formData: FormData) {
  await requirePermission('clients:edit');
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("No tenant context");

  const id = formData.get('clientId') as string;
  const name = formData.get('name') as string;
  const serviceId = formData.get('serviceId') as string || null;
  const departmentId = formData.get('departmentId') as string;
  const ownerId = formData.get('ownerId') as string;
  const accountableId = formData.get('accountableId') as string || null;
  const engagementId = formData.get('engagementId') as string || null;
  const engagementStatus = formData.get('engagementStatus') as string;
  const revenueStr = formData.get('revenue') as string;
  const revenue = revenueStr ? parseFloat(revenueStr) : null;
  const csmId = formData.get('csmId') as string || null;
  const pmId = formData.get('pmId') as string || null;
  const vcisoId = formData.get('vcisoId') as string || null;
  const nextSteps = formData.get('nextSteps') as string;
  const csmPmComments = formData.get('csmPmComments') as string;
  const executiveComments = formData.get('executiveComments') as string;

  await prisma.client.update({
    where: { id },
    data: {
      name,
      serviceId,
      departmentId,
      ownerId,
      accountableId,
      engagementId,
      engagementStatus,
      revenue,
      csmId,
      pmId,
      vcisoId,
      nextSteps,
      csmPmComments,
      executiveComments
    }
  });
  redirect('/admin/clients');
}

export async function updateClientMetadata(formData: FormData) {
  await requirePermission('clients:edit');
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("No tenant context");

  const id = formData.get('clientId') as string;
  const serviceId = formData.get('serviceId') as string || null;
  const engagementId = formData.get('engagementId') as string || null;
  const revenueStr = formData.get('revenue') as string;
  const revenue = revenueStr ? parseFloat(revenueStr) : null;
  const npsStr = formData.get('nps') as string;
  const nps = npsStr ? parseInt(npsStr, 10) : null;
  const kudosStr = formData.get('kudos') as string;
  const kudos = kudosStr ? parseInt(kudosStr, 10) : null;

  const engagementStatus = formData.get('engagementStatus') as string;
  const resourceLink = formData.get('resourceLink') as string;
  const nextSteps = formData.get('nextSteps') as string;
  const csmPmComments = formData.get('csmPmComments') as string;
  const executiveComments = formData.get('executiveComments') as string;

  const csmId = formData.get('csmId') as string || null;
  const pmId = formData.get('pmId') as string || null;
  const vcisoId = formData.get('vcisoId') as string || null;
  const accountableId = formData.get('accountableId') as string || null;

  await prisma.client.update({
    where: { id },
    data: {
      serviceId,
      engagementId,
      engagementStatus,
      revenue,
      nps,
      kudos,
      resourceLink,
      nextSteps,
      csmPmComments,
      executiveComments,
      csmId,
      pmId,
      vcisoId,
      accountableId,
      lastUpdated: new Date()
    }
  });

  revalidatePath(`/clients/${id}`);
}

export async function deleteClient(formData: FormData) {
  const getFd = (name: string) => formData.get(name) || formData.get(`0_${name}`) || formData.get(`1_${name}`) || formData.get(`2_${name}`);

  const user = await getCurrentUser();
  if (!user || !['ADMIN', 'EXECUTIVE'].includes(user.role)) {
    throw new Error("Unauthorized: Only Admins or Executives can delete clients.");
  }

  const mfaCode = getFd('mfaCode') as string;
  const clientId = getFd('clientId') as string;

  if (!mfaCode) throw new Error("MFA Code is required for deletion.");

  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("No tenant context");

  const p = prisma as any;
  const dbUser = await p.user.findFirst({ where: { id: user.id, tenantId } });
  if (!dbUser || !dbUser.mfaSecret) throw new Error("MFA is not configured for your account. Cannot verify deletion.");

  const verified = speakeasy.totp.verify({
    secret: dbUser.mfaSecret,
    encoding: 'base32',
    token: mfaCode
  });

  if (!verified) throw new Error("Invalid MFA Code.");

  await p.client.update({
    where: { id: clientId, tenantId },
    data: { deletedAt: new Date() }
  });
  revalidatePath('/admin/clients');
  revalidatePath('/admin/recycle-bin');
  redirect('/admin/clients');
}

export async function restoreClient(formData: FormData) {
  await requirePermission('clients:edit');
  const clientId = formData.get('clientId') as string;
  try {
    await prisma.client.update({
      where: { id: clientId },
      data: { deletedAt: null }
    });
    revalidatePath('/admin/recycle-bin');
    revalidatePath('/admin/clients');
    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Restore client failed:', error);
    return { success: false, error: 'Failed to restore client.' };
  }
}

export async function hardDeleteClient(formData: FormData) {
  await requirePermission('clients:edit');
  const clientId = formData.get('clientId') as string;
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath('/admin/recycle-bin');
}
