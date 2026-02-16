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
  Target
} from 'lucide-react';
import { logout } from '@/app/actions/auth';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

export function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Performance', href: '/performance', icon: BarChart2 },
    { name: 'Strategy', href: '/strategy', icon: Target },
  ];

  const adminItems = [
    { name: 'User Management', href: '/admin/users', icon: Shield },
    { name: 'Recycle Bin', href: '/admin/recycle-bin', icon: Trash2 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

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
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
          <Shield className="text-white w-6 h-6" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col transition-opacity duration-300">
            <span className="text-lg font-bold text-slate-800 tracking-tight leading-none">Health</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise</span>
          </div>
        )}
      </div>

      {/* Main Nav */}
      <nav className="flex-1 px-4 space-y-1.5 scrollbar-none overflow-y-auto">
        <div className={cn("mb-4 px-2", isCollapsed ? "hidden" : "block")}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Dashboard</span>
        </div>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all duration-300 group relative",
              isActive(item.href)
                ? "bg-slate-50 text-blue-600 shadow-sm"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive(item.href) ? "text-blue-600" : "text-slate-400")} />
            {!isCollapsed && (
              <span className="font-bold text-[13px] tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">{item.name}</span>
            )}
            {isActive(item.href) && (
              <div className="absolute left-0 w-1.5 h-6 bg-blue-600 rounded-r-full shadow-[2px_0_10px_rgba(37,99,235,0.4)]" />
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </Link>
        ))}

        <div className={cn("mt-10 mb-4 px-2", isCollapsed ? "hidden" : "block")}>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">System</span>
        </div>
        {adminItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-4 px-3.5 py-3 rounded-2xl transition-all duration-300 group relative",
              isActive(item.href)
                ? "bg-slate-50 text-blue-600 shadow-sm"
                : "text-slate-500 hover:bg-slate-50/50 hover:text-slate-800"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110", isActive(item.href) ? "text-blue-600" : "text-slate-400")} />
            {!isCollapsed && (
              <span className="font-bold text-[13px] tracking-tight whitespace-nowrap opacity-100 transition-opacity duration-300">{item.name}</span>
            )}
            {isCollapsed && (
              <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                {item.name}
              </div>
            )}
          </Link>
        ))}
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
