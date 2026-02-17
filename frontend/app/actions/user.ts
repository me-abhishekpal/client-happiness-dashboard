'use server';
// FIX_MARKER_V1

import { prisma } from '@/lib/prisma-tenant';
import { getTenantId } from '@/lib/tenant-context';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { randomBytes } from 'crypto';


import { requirePermission } from '@/lib/rbac';


export async function createUser(formData: FormData) {
  await requirePermission('users:edit');
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error("No tenant context");

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const roleId = formData.get('roleId') as string;
  const titleId = formData.get('titleId') as string; // Title Rel ID
  const managerId = formData.get('managerId') as string;

  try {
    // Check for collision
    const existing = await prisma.user.findFirst({
      where: { email, deletedAt: null }
    });

    if (existing) {
      return { success: false, error: `A user with the email ${email} already exists.` };
    }

    // Generate Invite Token
    const inviteToken = randomBytes(32).toString('hex');
    const inviteTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Fetch role name for legacy support
    const roleObj = await prisma.role.findUnique({ where: { id: roleId } });
    const roleName = roleObj?.name || 'VIEWER';

    await prisma.user.create({
      data: {
        name,
        email,
        role: roleName,
        roleId,
        titleId: titleId || null,
        managerId: managerId || null,
        inviteToken,
        inviteTokenExpiry,
        tenantId: tenantId!
      } as any
    });

    // Send Invitation Email
    try {
      const { sendEmail } = await import('@/lib/email');
      const { generateInviteEmail } = await import('@/lib/email-templates');

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const { html, text } = generateInviteEmail({
        userName: name,
        inviteToken,
        baseUrl
      });

      await sendEmail({
        to: email,
        subject: '✨ Welcome to Client Happiness Dashboard',
        text,
        html
      });

      console.log(`✅ Invitation email sent to ${email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send invitation email:', emailError);
      // Don't fail the user creation if email fails
      console.log(`📧 FALLBACK - Invitation link for ${email}: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/setup-password?token=${inviteToken}`);
    }


    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Create user failed:', error);
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return { success: false, error: `Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function updateUser(formData: FormData) {
  await requirePermission('users:edit');
  const id = formData.get('userId') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const roleId = formData.get('roleId') as string;
  const titleId = formData.get('titleId') as string;
  const managerId = formData.get('managerId') as string;

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

    // Fetch role name for legacy support
    const roleObj = await prisma.role.findUnique({ where: { id: roleId } });
    const roleName = roleObj?.name || 'VIEWER';

    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: roleName,
        roleId,
        titleId: titleId || null,
        managerId: managerId || null
      }
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Update user failed:', error);
    return { success: false, error: 'Failed to update user. Please try again.' };
  }
}

export async function deleteUser(formData: FormData) {
  await requirePermission('users:edit');
  const tenantId = await getTenantId();
  if (!tenantId) return;

  const userId = formData.get('userId') as string;

  const user = await prisma.user.findFirst({
    where: { id: userId }
  });
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
  await requirePermission('users:edit');
  const tenantId = await getTenantId();
  if (!tenantId) return { success: false, error: 'No tenant context' };

  const userId = formData.get('userId') as string;

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId }
    });
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
  await requirePermission('users:edit');
  const tenantId = await getTenantId();
  if (!tenantId) return { success: false, error: 'No tenant context' };

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

// Reassignment Logic for Safe Wipe
export async function getWipeConflicts(userId: string) {
  const tenantId = await getTenantId();
  if (!tenantId) return { owned: 0, accountable: 0 };

  const owned = await prisma.client.count({ where: { ownerId: userId, deletedAt: null } });
  const accountable = await prisma.client.count({ where: { accountableId: userId, deletedAt: null } });
  return { owned, accountable };
}

export async function getPotentialSuccessors(excludeUserId: string) {
  const tenantId = await getTenantId();
  if (!tenantId) return [];

  return await prisma.user.findMany({
    where: {
      id: { not: excludeUserId },
      deletedAt: null,
      OR: [{ role: 'MANAGER' }, { role: 'EXECUTIVE' }, { role: 'ADMIN' }]
    },
    select: { id: true, name: true, role: true }
  });
}

export async function wipeUserWithReassignment(formData: FormData) {
  const tenantId = await getTenantId();
  if (!tenantId) return { success: false, error: 'No tenant context' };

  const userId = formData.get('userId') as string;
  const successorId = formData.get('successorId') as string;

  if (!successorId) return { success: false, error: 'No successor selected.' };

  try {
    await prisma.$transaction([
      // 1. Transfer active items
      prisma.client.updateMany({
        where: { ownerId: userId, deletedAt: null },
        data: { ownerId: successorId }
      }),
      prisma.client.updateMany({
        where: { accountableId: userId, deletedAt: null },
        data: { accountableId: successorId }
      }),

      // 2. Clear cascades for historical data
      prisma.statusUpdate.deleteMany({ where: { userId } }),
      prisma.file.deleteMany({ where: { uploadedById: userId } }),
      prisma.escalation.deleteMany({ where: { ownerId: userId } }),

      // 3. Nullify department head
      prisma.department.updateMany({
        where: { headId: userId },
        data: { headId: null }
      }),

      // 4. Finally wipe the user
      prisma.user.delete({ where: { id: userId } })
    ]);

    revalidatePath('/admin/recycle-bin');
    revalidatePath('/admin/users');
    revalidatePath('/admin/clients');
    return { success: true };
  } catch (error) {
    console.error('Wipe with reassignment failed:', error);
    return { success: false, error: 'Failed to transfer and wipe user.' };
  }
}

export async function resetUserMFA(formData: FormData) {
  await requirePermission('users:edit');
  const tenantId = await getTenantId();
  if (!tenantId) return { success: false, error: 'No tenant context' };

  const userId = formData.get('userId') as string;

  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { name: true, email: true, mfaEnabled: true }
    });

    if (!user) {
      return { success: false, error: 'User not found.' };
    }

    if (!user.mfaEnabled) {
      return { success: false, error: 'This user does not have MFA enabled.' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        mfaEnabled: false,
        mfaSecret: null
      }
    });

    revalidatePath('/admin/users');
    return { success: true };
  } catch (error) {
    console.error('Reset MFA failed:', error);
    return { success: false, error: 'Failed to reset MFA. Please try again.' };
  }
}
