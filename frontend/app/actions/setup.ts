"use server";

import { prisma } from '@/lib/prisma-tenant';
import { getTenantId } from '@/lib/tenant-context';
import bcrypt from 'bcryptjs';

export async function setupPassword(token: string, password: string) {
    try {
        const tenantId = await getTenantId();
        if (!tenantId) throw new Error("No tenant context");

        // 1. Find user by token
        const user = await prisma.user.findFirst({
            where: {
                inviteToken: token,
                tenantId,
                deletedAt: null // Ensure user isn't deleted
            }
        });

        if (!user) {
            return { success: false, error: 'Invalid or expired invitation token.' };
        }

        // 2. Check Expiry
        if (user.inviteTokenExpiry && user.inviteTokenExpiry < new Date()) {
            return { success: false, error: 'Invitation token has expired.' };
        }

        // 3. Hash Password
        const passwordHash = await bcrypt.hash(password, 10);

        // 4. Update User
        await prisma.user.update({
            where: { id: user.id, tenantId },
            data: {
                passwordHash,
                inviteToken: null, // Clear token
                inviteTokenExpiry: null,
                // Ensure account is active if we had an active flag
            }
        });

        return { success: true };
    } catch (error) {
        console.error('Setup password failed:', error);
        return { success: false, error: 'Failed to set password.' };
    }
}
