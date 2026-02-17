'use server';
// FIX_MARKER_V1

import { getTenantId } from '@/lib/tenant-context';
import { prisma } from '@/lib/prisma-tenant';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/rbac';


export async function createClient(formData: FormData) {
  await requirePermission('clients:edit');
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("No tenant context");

  const name = formData.get('name') as string;
  const serviceType = formData.get('serviceType') as string;
  const departmentId = formData.get('departmentId') as string;
  const ownerId = formData.get('ownerId') as string;
  const accountableId = formData.get('accountableId') as string || null;
  const currentEngagement = formData.get('currentEngagement') as string;
  const engagementStatus = formData.get('engagementStatus') as string;
  const resourceLink = formData.get('resourceLink') as string;
  const csmName = formData.get('csmName') as string;
  const pmName = formData.get('pmName') as string;
  const vcisoName = formData.get('vcisoName') as string;
  const nextSteps = formData.get('nextSteps') as string;
  const csmPmComments = formData.get('csmPmComments') as string;
  const executiveComments = formData.get('executiveComments') as string;

  const newClient = await prisma.client.create({
    data: {
      name,
      serviceType,
      departmentId,
      ownerId,
      accountableId,
      status: 'UNKNOWN',
      currentEngagement,
      engagementStatus,
      resourceLink,
      csmName,
      pmName,
      vcisoName,
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
  const serviceType = formData.get('serviceType') as string;
  const departmentId = formData.get('departmentId') as string;
  const ownerId = formData.get('ownerId') as string;
  const accountableId = formData.get('accountableId') as string || null;
  const currentEngagement = formData.get('currentEngagement') as string;
  const engagementStatus = formData.get('engagementStatus') as string;
  const resourceLink = formData.get('resourceLink') as string;
  const csmName = formData.get('csmName') as string;
  const pmName = formData.get('pmName') as string;
  const vcisoName = formData.get('vcisoName') as string;
  const nextSteps = formData.get('nextSteps') as string;
  const csmPmComments = formData.get('csmPmComments') as string;
  const executiveComments = formData.get('executiveComments') as string;

  await prisma.client.update({
    where: { id },
    data: {
      name,
      serviceType,
      departmentId,
      ownerId,
      accountableId,
      currentEngagement,
      engagementStatus,
      resourceLink,
      csmName,
      pmName,
      vcisoName,
      nextSteps,
      csmPmComments,
      executiveComments
    }
  });
  redirect('/admin/clients');
}

export async function deleteClient(formData: FormData) {
  await requirePermission('clients:edit');
  const clientId = formData.get('clientId') as string;
  await prisma.client.update({
    where: { id: clientId },
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
