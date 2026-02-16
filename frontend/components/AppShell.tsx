// components/AppShell.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { cn } from '@/lib/utils';

export function AppShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Persistence logic (optional, but good for UX)
    useEffect(() => {
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved !== null) {
            setIsCollapsed(JSON.parse(saved));
        }
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
        }
    }, [isCollapsed, mounted]);

    if (!mounted) return null;

    return (
        <div className="flex min-h-screen bg-brand-bg">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
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
