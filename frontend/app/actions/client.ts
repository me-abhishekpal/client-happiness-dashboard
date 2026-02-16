// app/actions/client.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function createClient(formData: FormData) {
  const name = formData.get('name') as string;
  const serviceType = formData.get('serviceType') as string;
  const departmentId = formData.get('departmentId') as string;
  const ownerId = formData.get('ownerId') as string;

  await prisma.client.create({
    data: {
      name,
      serviceType,
      departmentId,
      ownerId,
      status: 'UNKNOWN'
    }
  });
  revalidatePath('/clients');
  revalidatePath('/admin/clients');
}

export async function updateClient(formData: FormData) {
  const id = formData.get('clientId') as string;
  const name = formData.get('name') as string;
  const serviceType = formData.get('serviceType') as string;
  const departmentId = formData.get('departmentId') as string;
  const ownerId = formData.get('ownerId') as string;

  await prisma.client.update({
    where: { id },
    data: {
      name,
      serviceType,
      departmentId,
      ownerId
    }
  });
  redirect('/admin/clients');
}

export async function deleteClient(formData: FormData) {
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
  const clientId = formData.get('clientId') as string;
  await prisma.client.delete({ where: { id: clientId } });
  revalidatePath('/admin/recycle-bin');
}
