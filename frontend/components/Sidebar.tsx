'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart, User, Shield, Building, LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth';

export function Sidebar() {
  const pathname = usePathname();

  // Helper to determine active state
  // "Overview" (/dashboard) is active on /dashboard exactly, or usually subpages unless they have their own link
  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(path);
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 fixed h-full flex flex-col">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Shield className="h-8 w-8 text-blue-600" />
          <span className="text-xl font-bold text-gray-900">Health</span>
        </div>
      </div>
      
      <nav className="mt-6 px-4 space-y-2 flex-1">
        <Link 
          href="/dashboard" 
          className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${
            isActive('/dashboard') 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <BarChart className="h-5 w-5" />
          <span>Overview</span>
        </Link>
        <Link 
          href="/clients" 
          className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${
            isActive('/clients') 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <User className="h-5 w-5" />
          <span>Clients</span>
        </Link>
        
        <div className="pt-8 pb-2">
          <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Admin
          </p>
        </div>

        <Link 
          href="/admin/users" 
          className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${
            isActive('/admin/users') 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Shield className="h-5 w-5" />
          <span>Users</span>
        </Link>
        <Link 
          href="/admin/clients" 
          className={`flex items-center space-x-3 px-3 py-2 rounded-md font-medium transition-colors ${
            isActive('/admin/clients') 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          }`}
        >
          <Building className="h-5 w-5" />
          <span>Clients</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <form action={() => logout()}>
          <button type="submit" className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-md w-full transition-colors font-medium">
            <LogOut className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
