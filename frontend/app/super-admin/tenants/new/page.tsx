// app/super-admin/tenants/new/page.tsx
'use server';

import { prisma } from '@/lib/prisma-tenant';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function NewTenantPage() {
    const p = prisma as any;
    async function createTenant(formData: FormData) {
        'use server';

        const name = formData.get('name') as string;
        const slug = formData.get('slug') as string;
        const subdomain = formData.get('subdomain') as string;
        const allowedEmailDomain = formData.get('allowedEmailDomain') as string;
        const plan = formData.get('plan') as string;

        await p.tenant.create({
            data: {
                name,
                slug,
                subdomain,
                allowedEmailDomain,
                plan,
                status: 'active'
            }
        });

        revalidatePath('/super-admin');
        redirect('/super-admin');
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Create New Tenant</h1>
                <p className="text-slate-400">Add a new organization to the platform</p>
            </div>

            <form action={createTenant} className="space-y-6 bg-slate-800/50 border border-slate-700 p-8 rounded-xl">
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

                <div className="pt-4 flex gap-4">
                    <Link href="/super-admin" className="flex-1 text-center py-2 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-bold shadow-lg shadow-emerald-900/20 transition-all"
                    >
                        Create Organization
                    </button>
                </div>
            </form>
        </div>
    );
}

// Helper to keep Link working in a server component that uses 'use server' for its children?
// Actually, it's simpler to separate the client and server parts, but for an MVP this is okay.
import Link from 'next/link';
