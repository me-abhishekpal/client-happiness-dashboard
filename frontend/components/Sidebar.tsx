// components/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart2,
  Users,
  Settings,
  Shield,
  Trash2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  LayoutDashboard,
  Target,
  Briefcase,
  FileText,
  FileSignature,
} from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
  role?: string;
  permissions?: string[];
  logo?: string;
  companyName?: string;
}

export function Sidebar({ isCollapsed, setIsCollapsed, role, permissions = [], logo, companyName }: SidebarProps) {
  const pathname = usePathname();

  const hasPerm = (p: string) => permissions.includes(p) || permissions.includes('*') || role === 'SUPERADMIN' || role === 'ADMIN';

  // Define sidebar items with associated permissions
  const allItems = [
    { group: 'dashboard', name: 'Overview', href: '/dashboard', icon: LayoutDashboard, perm: 'dashboard:view' },
    { group: 'dashboard', name: 'Clients', href: '/clients', icon: Users, perm: 'clients:view' },
    { group: 'dashboard', name: 'Performance', href: '/performance', icon: BarChart2, perm: 'performance:view' },
    { group: 'dashboard', name: 'Strategy', href: '/strategy', icon: Target, perm: 'strategy:view' },
    { group: 'dashboard', name: 'Reports', href: '/reports', icon: FileText, perm: 'reports:view' },
    { group: 'dashboard', name: 'Contracts', href: '/contracts', icon: FileSignature, perm: 'contracts:view' },

    { group: 'system', name: 'User Management', href: '/admin/users', icon: Shield, perm: 'users:view' },
    { group: 'system', name: 'Role Management', href: '/admin/roles', icon: Shield, perm: 'roles:view' },
    { group: 'system', name: 'Titles', href: '/admin/titles', icon: Briefcase, perm: 'titles:view' },
    // { group: 'system', name: 'Org Chart', href: '/admin/org-chart', icon: Users, perm: 'org_chart:view' }, // Hidden
    { group: 'system', name: 'Recycle Bin', href: '/admin/recycle-bin', icon: Trash2, perm: 'recycle_bin:view' },
    { group: 'system', name: 'Settings', href: '/admin/branding', icon: Settings, perm: 'settings:view' }, // Pointing Settings to branding as it's the main settings page
  ];

  const dashboardItems = allItems.filter(i => i.group === 'dashboard' && hasPerm(i.perm));
  const systemItems = allItems.filter(i => i.group === 'system' && hasPerm(i.perm));

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white border-r border-slate-100 transition-all duration-500 ease-in-out z-30 flex flex-col shadow-[4px_0_24px_-2px_rgba(0,0,0,0.02)]",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-10 w-6 h-6 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all text-slate-400 hover:text-slate-600 z-40"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Logo Section */}
      <div className="p-6 mb-4 flex items-center gap-3 overflow-hidden">
        {logo ? (
          <img src={logo} alt="Organization Logo" className="w-10 h-10 object-contain shrink-0" />
        ) : (
          <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-primary/20">
            <Shield className="text-white w-6 h-6" />
          </div>
        )}
        {!isCollapsed && (
          <div className="flex flex-col transition-opacity duration-300">
            <span className="text-lg font-bold text-slate-800 tracking-tight leading-none">
              {companyName || 'Health'}
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
              Enterprise
            </span>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 space-y-1.5 scrollbar-none overflow-y-auto">
        <div className={cn("mb-4 px-2", isCollapsed ? "hidden" : "block")}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Dashboard</span>
        </div>
        {dashboardItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all duration-300 group relative",
              isActive(item.href)
                ? "bg-slate-50 text-brand-primary shadow-sm"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive(item.href) ? "text-brand-primary" : "text-slate-400")} />
            {!isCollapsed && (
              <span className="font-bold text-[13px] tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">{item.name}</span>
            )}
            {isActive(item.href) && (
              <div className="absolute left-0 w-1.5 h-6 bg-brand-primary rounded-r-full shadow-md" />
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </Link>
        ))}

        {systemItems.length > 0 && (
          <>
            <div className={cn("mt-10 mb-4 px-2", isCollapsed ? "hidden" : "block")}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">System</span>
            </div>
            {systemItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all duration-300 group relative",
                  isActive(item.href)
                    ? "bg-slate-50 text-brand-primary shadow-sm"
                    : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
                )}
              >
                <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive(item.href) ? "text-brand-primary" : "text-slate-400")} />
                {!isCollapsed && (
                  <span className="font-bold text-[13px] tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">{item.name}</span>
                )}
                {isActive(item.href) && (
                  <div className="absolute left-0 w-1.5 h-6 bg-brand-primary rounded-r-full shadow-md" />
                )}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-50 mb-4">
        <form action={() => logout()}>
          <button
            type="submit"
            className={cn(
              "flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all duration-300 group text-slate-400 hover:bg-red-50 hover:text-red-500 w-full",
              isCollapsed && "justify-center"
            )}
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!isCollapsed && (
              <span className="font-bold text-[13px] tracking-tight transition-opacity duration-300">Sign Out</span>
            )}
          </button>
        </form>
      </div>
    </aside>
  );
}
