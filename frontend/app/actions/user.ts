// app/actions/user.ts
'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function createUser(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const title = formData.get('title') as string;

  await prisma.user.create({
    data: { name, email, role, title }
  });
  revalidatePath('/admin/users');
}

export async function updateUser(formData: FormData) {
  const id = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const title = formData.get('title') as string;

  await prisma.user.update({
    where: { id },
    data: { name, email, role, title }
  });
  redirect('/admin/users'); // Clear edit mode
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get('userId') as string;
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath('/admin/users');
}
