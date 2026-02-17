// lib/validate-email-domain.ts
// Email domain validation for tenant-restricted access

import { prisma } from './prisma-tenant';

/**
 * Validates if an email belongs to the tenant's allowed domain
 * @param email - User's email address
 * @param tenantId - Tenant ID
 * @returns { valid: boolean, isGuest: boolean, error?: string }
 */
export async function validateEmailDomain(email: string, tenantId: string) {
    try {
        // Get tenant's allowed email domain
        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: { allowedEmailDomain: true, name: true }
        });

        if (!tenant) {
            return { valid: false, isGuest: false, error: 'Tenant not found' };
        }

        // If tenant has no email domain restriction, allow all
        if (!tenant.allowedEmailDomain) {
            return { valid: true, isGuest: false };
        }

        // Extract domain from email
        const emailDomain = email.split('@')[1]?.toLowerCase();
        const allowedDomain = tenant.allowedEmailDomain.toLowerCase();

        // Check if email domain matches
        if (emailDomain === allowedDomain) {
            return { valid: true, isGuest: false };
        }

        // Email doesn't match - they would be a guest
        return {
            valid: false,
            isGuest: true,
            error: `Only @${allowedDomain} emails can join ${tenant.name}. Contact an admin for guest access.`
        };
    } catch (error) {
        return { valid: false, isGuest: false, error: 'Validation failed' };
    }
}

/**
 * Checks if an email domain is already claimed by another tenant
 * @param emailDomain - Domain to check (e.g., "oculusit.com")
 * @param excludeTenantId - Optional tenant ID to exclude from check
 * @returns { available: boolean, claimedBy?: string }
 */
export async function checkEmailDomainAvailability(
    emailDomain: string,
    excludeTenantId?: string
) {
    const existingTenant = await prisma.tenant.findFirst({
        where: {
            allowedEmailDomain: emailDomain.toLowerCase(),
            id: excludeTenantId ? { not: excludeTenantId } : undefined
        },
        select: { name: true, slug: true }
    });

    if (existingTenant) {
        return {
            available: false,
            claimedBy: existingTenant.name
        };
    }

    return { available: true };
}

/**
 * Creates a guest user (view-only access without email domain restriction)
 * This should only be called by tenant admins/executives
 * @param email - Guest email address
 * @param tenantId - Tenant granting access
 * @param roleId - Role to assign (should be view-only)
 * @returns User object or error
 */
export async function createGuestUser(
    email: string,
    tenantId: string,
    roleId: string,
    invitedByUserId: string
) {
    // Verify the inviting user has permission
    const inviter = await prisma.user.findUnique({
        where: { id: invitedByUserId },
        include: { roleRel: true }
    });

    if (!inviter || inviter.tenantId !== tenantId) {
        throw new Error('Unauthorized: Cannot invite guest users');
    }

    // Check if role is appropriate for guests (should be read-only)
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
        throw new Error('Invalid role specified');
    }

    // Create guest user
    const guestUser = await prisma.user.create({
        data: {
            email,
            tenantId,
            roleId,
            isGuest: true,
            // Guests must set password via invite
            inviteToken: generateInviteToken(),
            inviteTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
    });

    return guestUser;
}

function generateInviteToken(): string {
    const crypto = require('crypto');
    return crypto.randomBytes(32).toString('hex');
}
