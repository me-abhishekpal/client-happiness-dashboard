import { NextRequest, NextResponse } from 'next/server';

/**
 * Multi-Tenant Proxy (Edge Compatible)
 * Extracts tenant indicators from hostname and injects into headers.
 * Database resolution is delegated to Server Components/Actions.
 */
export async function proxy(request: NextRequest) {
    const hostname = request.headers.get('host') || '';
    const url = request.nextUrl;

    // Skip middleware for static files and API health check
    if (
        url.pathname.startsWith('/_next') ||
        url.pathname.startsWith('/api/health') ||
        url.pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|css|js)$/)
    ) {
        return NextResponse.next();
    }

    const host = hostname.split(':')[0];
    const requestHeaders = new Headers(request.headers);

    // 1. Handle super admin panel first
    if (host === 'admin-rag.abhee.org' || host.startsWith('admin.')) {
        if (url.pathname === '/' || url.pathname === '/dashboard') {
            return NextResponse.redirect(new URL('/super-admin', request.url));
        }

        requestHeaders.set('x-tenant-type', 'superadmin');
        return NextResponse.next({
            request: {
                headers: requestHeaders,
            },
        });
    }

    // 2. Extract tenant indicators
    // Subdomain pattern: [tenant]-rag.abhee.org or [tenant].rag.abhee.org
    const subdomainMatch = host.match(/^([^.-]+)[.-]rag\.abhee\.org$/);

    if (subdomainMatch) {
        const subdomain = subdomainMatch[1];
        if (subdomain !== 'admin') {
            requestHeaders.set('x-tenant-subdomain', subdomain);
        }
    } else if (host === 'localhost' || host === '127.0.0.1') {
        requestHeaders.set('x-tenant-slug', 'default');
    } else if (!host.endsWith('.abhee.org')) {
        // Potential custom domain
        requestHeaders.set('x-tenant-custom-domain', host);
    }

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

// Configure which routes to run middleware on
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
