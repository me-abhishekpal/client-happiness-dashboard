// app/super-admin/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function SuperAdminLayout({ children }: { children: ReactNode }) {
    // Simple check for super admin session (to be improved with real auth)
    const cookieStore = await cookies();
    const isSuperAdmin = cookieStore.get('super_admin_session')?.value === 'true';

    if (!isSuperAdmin) {
        // redirect('/super-admin/login'); // Uncomment when login is ready
    }

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900">
                                S
                            </div>
                            <span className="font-bold text-xl tracking-tight">Super Admin</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-400">Platform Overview</span>
                            <div className="h-8 w-[1px] bg-slate-800"></div>
                            <button className="text-sm text-slate-400 hover:text-white transition-colors">
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
}
