// app/super-admin/page.tsx
import { prismaBase as prisma } from '@/lib/prisma-base';
import Link from 'next/link';

export default async function SuperAdminDashboard() {
    const p = prisma as any;
    // Fetch all tenants (Prisma middleware skips filtering if tenantId is missing in headers, 
    // which is the case for super-admin domain/subdomain)
    const tenants = await p.tenant.findMany({
        orderBy: { createdAt: 'desc' }
    });

    const stats = {
        totalTenants: tenants.length,
        activeTenants: tenants.filter(t => t.status === 'active').length,
        totalUsers: await p.user.count().catch(() => 0),
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Platform Overview</h1>
                    <p className="text-slate-400">Manage tenants and global platform settings</p>
                </div>
                <Link
                    href="/super-admin/tenants/new"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                    Create New Tenant
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Tenants</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalTenants}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Tenants</p>
                    <p className="text-4xl font-bold mt-2 text-emerald-400">{stats.activeTenants}</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Users (Global)</p>
                    <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
                </div>
            </div>

            {/* Tenants Table */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700">
                    <h2 className="text-lg font-semibold">Registered Tenants</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3 font-medium">Organization</th>
                                <th className="px-6 py-3 font-medium">Domain / Subdomain</th>
                                <th className="px-6 py-3 font-medium">Email Domain</th>
                                <th className="px-6 py-3 font-medium">Status</th>
                                <th className="px-6 py-3 font-medium">Plan</th>
                                <th className="px-6 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700">
                            {tenants.map((tenant) => (
                                <tr key={tenant.id} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-white">{tenant.name}</div>
                                        <div className="text-xs text-slate-500">{tenant.slug}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {tenant.customDomain ? (
                                            <div className="text-emerald-400 font-medium">{tenant.customDomain}</div>
                                        ) : (
                                            <div className="text-slate-300">{tenant.subdomain}-rag.abhee.org</div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <code className="bg-slate-900 px-2 py-1 rounded text-emerald-300 text-xs">
                                            @{tenant.allowedEmailDomain}
                                        </code>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                            }`}>
                                            {tenant.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-400">
                                        {tenant.plan}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={`/super-admin/tenants/${tenant.id}`}
                                            className="text-emerald-400 hover:text-emerald-300 font-medium text-sm"
                                        >
                                            Configure
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
