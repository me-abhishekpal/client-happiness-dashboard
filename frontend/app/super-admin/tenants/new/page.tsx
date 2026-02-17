// app/super-admin/tenants/new/page.tsx
import { createTenantWithAdmin } from '@/app/actions/super-admin';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function NewTenantPage() {
    return (
        <div className="max-w-2xl mx-auto pb-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Tenant</h1>
                <p className="text-slate-400">Setup a new organization and its initial administrator</p>
            </div>

            <form action={createTenantWithAdmin} className="space-y-8">
                {/* Organization Section */}
                <div className="space-y-6 bg-slate-800/50 border border-slate-700 p-8 rounded-xl">
                    <h2 className="text-xl font-bold text-emerald-400 border-b border-slate-700 pb-2">Organization Details</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Organization Name</label>
                        <input
                            name="name"
                            required
                            placeholder="e.g. Oculus IT"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">URL Slug</label>
                            <input
                                name="slug"
                                required
                                placeholder="oculusit"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300">Subdomain</label>
                            <div className="flex items-center gap-2">
                                <input
                                    name="subdomain"
                                    required
                                    placeholder="oculusit"
                                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                                />
                                <span className="text-slate-500 text-sm">-rag.abhee.org</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Allowed Email Domain</label>
                        <div className="flex items-center gap-2">
                            <span className="text-slate-500">@</span>
                            <input
                                name="allowedEmailDomain"
                                required
                                placeholder="oculusit.com"
                                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                            />
                        </div>
                        <p className="text-xs text-slate-500 italic">Only users with this email domain will be able to register.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Subscription Plan</label>
                        <select
                            name="plan"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white outline-none"
                        >
                            <option value="free">Free</option>
                            <option value="pro">Pro</option>
                            <option value="enterprise">Enterprise</option>
                        </select>
                    </div>
                </div>

                {/* Initial Admin Section */}
                <div className="space-y-6 bg-emerald-900/10 border border-emerald-500/20 p-8 rounded-xl shadow-lg shadow-emerald-900/10">
                    <h2 className="text-xl font-bold text-emerald-400 border-b border-emerald-500/20 pb-2">Initial Administrator</h2>
                    <p className="text-sm text-slate-400">This user will be created as the first tenant administrator.</p>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Admin Name</label>
                        <input
                            name="adminName"
                            required
                            placeholder="Full Name"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Admin Email</label>
                        <input
                            name="adminEmail"
                            type="email"
                            required
                            placeholder="admin@organization.com"
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                            Will receive invitation email immediately
                        </p>
                    </div>
                </div>

                <div className="pt-4 flex gap-4">
                    <Link href="/super-admin" className="flex-1 text-center py-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors font-medium">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all hover:-translate-y-0.5"
                    >
                        Create Organization & Admin
                    </button>
                </div>
            </form>
        </div>
    );
}
