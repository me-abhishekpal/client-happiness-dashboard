// components/AppShell.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export function AppShell({ children, role }: { children: React.ReactNode, role?: string }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    const pathname = usePathname();
    // Exclude sidebar on these paths
    const excludedPaths = ['/login', '/setup-password'];
    const shouldHideSidebar = excludedPaths.includes(pathname);

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
        return <main className="min-h-screen bg-brand-bg flex items-center justify-center">{children}</main>;
    }

    return (
        <div className="flex min-h-screen bg-brand-bg">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} role={role} />
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
