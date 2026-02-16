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

  try {
    // Check for collision with active users
    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null }
    });

    if (existing) {
      return { success: false, error: `A user with the email ${email} already exists.` };
    }

    await prisma.user.create({
      data: { name, email, role, title }
    });
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Create user failed:', error);
    return { success: false, error: 'Failed to create user.' };
  }
}

export async function updateUser(formData: FormData) {
  const id = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const role = formData.get('role') as string;
  const title = formData.get('title') as string;

  try {
    // Check for email collision with other active users
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: id },
        deletedAt: null
      }
    });

    if (existingUser) {
      return { success: false, error: `The email address ${email} is already in use by another active user.` };
    }

    await prisma.user.update({
      where: { id },
      data: { name, email, role, title }
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Update user failed:', error);
    return { success: false, error: 'Failed to update user. Please try again.' };
  }
}

export async function deleteUser(formData: FormData) {
  const userId = formData.get('userId') as string;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return;

  // Append a unique suffix to the email to free it up for others
  const timestamp = Date.now();
  const deletedEmail = `${user.email}.deleted.${timestamp}`;

  await prisma.user.update({
    where: { id: userId },
    data: {
      deletedAt: new Date(),
      email: deletedEmail
    }
  });
  revalidatePath('/admin/users');
  revalidatePath('/admin/recycle-bin');
}

export async function restoreUser(formData: FormData) {
  const userId = formData.get('userId') as string;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.email.includes('.deleted.')) {
      // Basic restore if no suffix found (legacy or already clean)
      await prisma.user.update({
        where: { id: userId },
        data: { deletedAt: null }
      });
    } else {
      // Strip the suffix and check for collision
      const originalEmail = user.email.split('.deleted.')[0];

      const collision = await prisma.user.findFirst({
        where: {
          email: originalEmail,
          deletedAt: null
        }
      });

      if (collision) {
        return { success: false, error: `Cannot restore user. The email ${originalEmail} is now taken by an active user (${collision.name}).` };
      }

      await prisma.user.update({
        where: { id: userId },
        data: {
          deletedAt: null,
          email: originalEmail
        }
      });
    }

    revalidatePath('/admin/recycle-bin');
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Restore user failed:', error);
    return { success: false, error: 'Failed to restore user.' };
  }
}

export async function hardDeleteUser(formData: FormData) {
  const userId = formData.get('userId') as string;

  try {
    // 1. Safety Check: Check if user owns active clients
    const activeOwnedClients = await prisma.client.findFirst({
      where: { ownerId: userId, deletedAt: null }
    });

    if (activeOwnedClients) {
      return { success: false, error: 'Cannot wipe user. They are still the owner of active clients. Please reassign ownership first.' };
    }

    const activeAccountableClients = await prisma.client.findFirst({
      where: { accountableId: userId, deletedAt: null }
    });

    if (activeAccountableClients) {
      return { success: false, error: 'Cannot wipe user. They are still accountable for active clients. Please reassign accountability first.' };
    }

    // 2. Clear cascades (StatusUpdates, Files, Escalations) and finally the User
    // We also nullify Department headId if this user was the head
    await prisma.$transaction([
      prisma.statusUpdate.deleteMany({ where: { userId } }),
      prisma.file.deleteMany({ where: { uploadedById: userId } }),
      prisma.escalation.deleteMany({ where: { ownerId: userId } }),
      prisma.department.updateMany({
        where: { headId: userId },
        data: { headId: null }
      }),
      prisma.user.delete({ where: { id: userId } })
    ]);

    revalidatePath('/admin/recycle-bin');
    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Wipe user failed:', error);
    return { success: false, error: 'Failed to permanently delete user record. This is likely due to active dependencies.' };
  }
}
