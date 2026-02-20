// components/AppShell.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export function AppShell({
    children,
    role,
    branding,
    permissions
}: {
    children: React.ReactNode,
    role?: string,
    permissions?: string[],
    branding?: {
        logo?: string;
        primaryColor?: string;
        secondaryColor?: string;
        companyName?: string;
    } | null
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();
    // Exclude sidebar on these paths
    const excludedPaths = ['/login', '/setup-password', '/tenant-not-found'];
    const isSuperAdminRoute = pathname?.startsWith('/super-admin');
    const shouldHideSidebar = excludedPaths.includes(pathname) || isSuperAdminRoute;

    // Persistence logic (optional, but good for UX)
    useEffect(() => {
        if (shouldHideSidebar) return; // Don't run persistence logic on full-screen pages
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved !== null) {
            setIsCollapsed(JSON.parse(saved));
        }
        setMounted(true);
    }, [shouldHideSidebar]);

    useEffect(() => {
        if (mounted && !shouldHideSidebar) {
            localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
        }
    }, [isCollapsed, mounted, shouldHideSidebar]);

    if (!mounted && !shouldHideSidebar) return null;

    if (shouldHideSidebar) {
        return (
            <main
                className="min-h-screen bg-brand-bg flex items-center justify-center"
                style={{
                    // @ts-ignore
                    '--brand-primary': branding?.primaryColor || '#10b981',
                    // @ts-ignore
                    '--brand-secondary': branding?.secondaryColor || '#059669',
                }}
            >
                {children}
            </main>
        );
    }

    return (
        <div
            className="flex min-h-screen bg-brand-bg"
            style={{
                // @ts-ignore
                '--brand-primary': branding?.primaryColor || '#10b981',
                // @ts-ignore
                '--brand-secondary': branding?.secondaryColor || '#059669',
            }}
        >
            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                role={role}
                permissions={permissions}
                logo={branding?.logo}
                companyName={branding?.companyName}
            />
            <main
                className={cn(
                    "flex-1 transition-all duration-500 ease-in-out",
                    isCollapsed ? "pl-20" : "pl-72"
                )}
            >
                {children}
            </main>
        </div>
    );
}
