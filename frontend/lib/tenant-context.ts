// lib/tenant-context.ts
// Server-side tenant context management
import { cache } from 'react';
import { headers } from 'next/headers';
import { prismaBase } from './prisma-base';

/**
 * Gets the current tenant ID.
 * Supports both direct ID from headers and resolution from indicators (subdomain, custom domain, slug).
 * Safe for Server Components and Server Actions.
 */
export const getTenantId = cache(async (): Promise<string | null> => {
    try {
        const headersList = await headers();

        // 1. Direct ID (if already set)
        const id = headersList.get('x-tenant-id');
        if (id) return id;

        // 2. Resolve from indicators (set by edge-compatible middleware)
        const subdomain = headersList.get('x-tenant-subdomain');
        const customDomain = headersList.get('x-tenant-custom-domain');
        const slug = headersList.get('x-tenant-slug');

        if (!subdomain && !customDomain && !slug) return null;

        const p = prismaBase as any;
        let tenant = null;

        if (customDomain) {
            tenant = await p.tenant.findUnique({
                where: { customDomain, domainVerified: true },
                select: { id: true }
            });
        } else if (subdomain) {
            tenant = await p.tenant.findUnique({
                where: { subdomain },
                select: { id: true }
            });
        } else if (slug) {
            tenant = await p.tenant.findUnique({
                where: { slug },
                select: { id: true }
            });
        }

        return tenant?.id || null;
    } catch (error) {
        console.error('Failed to resolve tenant ID:', error);
        return null;
    }
});

/**
 * Gets the current tenant slug from request headers
 */
export const getTenantSlug = cache(async (): Promise<string | null> => {
    try {
        const headersList = await headers();
        return headersList.get('x-tenant-slug');
    } catch (e) {
        return null;
    }
});

/**
 * Gets the current tenant domain from request headers
 */
export const getTenantDomain = cache(async (): Promise<string | null> => {
    try {
        const headersList = await headers();
        return headersList.get('x-tenant-domain');
    } catch (e) {
        return null;
    }
});

/**
 * Checks if the current request is from super admin panel
 */
export const isSuperAdmin = cache(async (): Promise<boolean> => {
    try {
        const headersList = await headers();
        return headersList.get('x-tenant-type') === 'superadmin';
    } catch (e) {
        return false;
    }
});

/**
 * Gets full tenant information
 */
export async function getCurrentTenant() {
    try {
        const tenantId = await getTenantId();
        if (!tenantId) return null;

        const p = prismaBase as any;
        const tenant = await p.tenant.findUnique({
            where: { id: tenantId },
            select: {
                id: true,
                slug: true,
                name: true,
                subdomain: true,
                customDomain: true,
                allowedEmailDomain: true,
                branding: true,
                plan: true,
                status: true
            }
        });

        return tenant;
    } catch (error) {
        console.error('Error fetching tenant:', error);
        return null;
    }
}

/**
 * Gets the current tenant branding configuration
 */
export const getTenantBranding = cache(async () => {
    try {
        const tenant = await getCurrentTenant();
        if (!tenant || !tenant.branding) return null;

        return JSON.parse(tenant.branding);
    } catch (e) {
        console.error('Failed to parse branding JSON:', e);
        return null;
    }
});

/**
 * Validates that a user belongs to the current tenant
 */
export async function validateTenantAccess(userId: string): Promise<boolean> {
    try {
        const tenantId = await getTenantId();
        if (!tenantId) return false;

        const p = prismaBase as any;
        const user = await p.user.findUnique({
            where: { id: userId },
            select: { tenantId: true }
        });

        return user?.tenantId === tenantId;
    } catch (error) {
        console.error('Error validating tenant access:', error);
        return false;
    }
}
