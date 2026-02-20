// middleware.ts
// Sets tenant context headers for every request.
// In production: resolves tenant from subdomain or custom domain.
// In local dev: falls back to 'default' tenant for localhost.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();
    const host = request.headers.get('host') || '';

    // --- Super Admin Panel ---
    if (host.startsWith('super-admin.') || host.startsWith('admin-rag.')) {
        response.headers.set('x-tenant-type', 'superadmin');
        return response;
    }

    // --- Resolve Tenant Indicators ---

    // Custom domain (e.g. happiness.acme.com) - not localhost
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    if (!isLocalhost) {
        // Try subdomain resolution: e.g. "acme.rag.abhee.org" → subdomain = "acme"
        const parts = host.split('.');
        if (parts.length >= 3) {
            // Has a subdomain prefix
            let subdomain = parts[0];
            // The DB stores the pure prefix (e.g. 'acme'), but the deployed URL exposes 'acme-rag.abhee.org'
            if (subdomain.endsWith('-rag')) {
                subdomain = subdomain.slice(0, -4);
            }
            response.headers.set('x-tenant-subdomain', subdomain);
        } else {
            // Treat as custom domain
            response.headers.set('x-tenant-custom-domain', host.split(':')[0]);
        }
        return response;
    }

    // --- Local Dev Fallback ---
    // When running on localhost, use the 'default' tenant
    const devSlug = process.env.DEV_TENANT_SLUG || 'default';
    response.headers.set('x-tenant-slug', devSlug);

    return response;
}

export const config = {
    matcher: [
        // Run on all paths except static files and Next internals
        '/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.svg|.*\\.jpg).*)',
    ],
};
