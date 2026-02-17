import { prismaBase as prisma } from '@/lib/prisma-base';
import Link from 'next/link';
import { DeleteAdminButton } from '@/components/DeleteAdminButton';
import { createTenantAdmin, deleteTenantAdmin, updateTenantAction } from '@/app/actions/super-admin';
import { redirect } from 'next/navigation';

export default async function EditTenantPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const p = prisma as any;

    const tenant = await p.tenant.findUnique({
        where: { id }
    });

    if (!tenant) redirect('/super-admin');

    // Pre-bind actions with tenantId
    const boundUpdateTenant = updateTenantAction.bind(null, id);
    const boundCreateAdmin = createTenantAdmin.bind(null, id);
    const boundDeleteAdmin = deleteTenantAdmin.bind(null, id);

    const admins = await p.user.findMany({
        where: { tenantId: id, role: 'ADMIN', deletedAt: null }
    });

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold">Configure Tenant</h1>
                    <p className="text-slate-400">{tenant.name} · {tenant.slug}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${tenant.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                    {tenant.status}
                </span>
            </div>

            <form action={boundUpdateTenant} className="space-y-6 bg-slate-800/50 border border-slate-700 p-8 rounded-xl">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Organization Name</label>
                    <input
                        name="name"
                        defaultValue={tenant.name}
                        required
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Custom Domain</label>
                    <input
                        name="customDomain"
                        defaultValue={tenant.customDomain || ''}
                        placeholder="e.g. ragstatus.oculusit.com"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <div className="flex items-center gap-2 mt-2">
                        <input
                            type="checkbox"
                            name="domainVerified"
                            defaultChecked={tenant.domainVerified}
                            id="domainVerified"
                            className="w-4 h-4 bg-slate-900 border-slate-700 rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="domainVerified" className="text-sm text-slate-400">Domain Verified (Activate access via custom domain)</label>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Allowed Email Domain</label>
                    <div className="flex items-center gap-2">
                        <span className="text-slate-500">@</span>
                        <input
                            name="allowedEmailDomain"
                            defaultValue={tenant.allowedEmailDomain || ''}
                            required
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Plan</label>
                        <select
                            name="plan"
                            defaultValue={tenant.plan}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                        >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Status</label>
                        <select
                            name="status"
                            defaultValue={tenant.status}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                        >
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                    <Link href="/super-admin" className="flex-1 text-center py-2 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all"
                    >
                        Save Changes
                    </button>
                </div>
            </form>

            <div className="mt-12 space-y-6">
                <div className="border-b border-slate-700 pb-2">
                    <h2 className="text-xl font-bold">Tenant Administrators</h2>
                    <p className="text-sm text-slate-400">Manage individuals with full access to this tenant.</p>
                </div>

                {admins.length > 0 ? (
                    <div className="bg-slate-800/30 border border-slate-700 rounded-xl overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-700/50 text-slate-300 uppercase text-xs font-bold">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {admins.map((admin: any) => (
                                    <tr key={admin.id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="px-6 py-4 font-medium">{admin.name}</td>
                                        <td className="px-6 py-4 text-slate-400">{admin.email}</td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${admin.passwordHash ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                                {admin.passwordHash ? 'Active' : 'Pending'}
                                            </span>
                                            <DeleteAdminButton adminId={admin.id} onDelete={boundDeleteAdmin} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-slate-800/30 border border-dashed border-slate-700 rounded-xl text-slate-500">
                        No administrators found for this organization.
                    </div>
                )}

                <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-xl">
                    <h3 className="font-bold text-emerald-400 mb-4">Add New Administrator</h3>
                    <form action={boundCreateAdmin} className="flex gap-4">
                        <input
                            name="name"
                            placeholder="Full Name"
                            required
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <input
                            name="email"
                            type="email"
                            placeholder="email@example.com"
                            required
                            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                        <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-bold transition-all"
                        >
                            Create
                        </button>
                    </form>
                    <p className="mt-4 text-xs text-slate-500">
                        They will receive an invitation email to set their password. Note: The email domain restriction is bypassed for admins created via this panel.
                    </p>
                </div>
            </div>
        </div>
    );
}
