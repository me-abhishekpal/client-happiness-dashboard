import { getCurrentTenant, getTenantBranding } from '@/lib/tenant-context';
import { prismaBase as prisma } from '@/lib/prisma-base';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requirePermission, hasPermission } from '@/lib/rbac';

export default async function BrandingPage() {
    await requirePermission('settings:view');
    const canEdit = await hasPermission('settings:edit');

    const tenant = await getCurrentTenant();
    const branding = await getTenantBranding();

    async function updateBranding(formData: FormData) {
        'use server';
        if (!await hasPermission('settings:edit')) throw new Error("Unauthorized");
        const tenantId = await (await getCurrentTenant())?.id;
        if (!tenantId) return;

        const companyName = formData.get('companyName') as string;
        const primaryColor = formData.get('primaryColor') as string;
        const secondaryColor = formData.get('secondaryColor') as string;
        const logoUrl = formData.get('logoUrl') as string;

        const updatedBranding = {
            companyName,
            primaryColor,
            secondaryColor,
            logo: logoUrl || null
        };

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                branding: JSON.stringify(updatedBranding)
            }
        });

        revalidatePath('/', 'layout');
        redirect('/dashboard');
    }

    return (
        <div className="max-w-4xl mx-auto p-8">
            <div className="mb-10">
                <h1 className="text-4xl font-black text-slate-900 tracking-tight">Organization Branding</h1>
                <p className="text-slate-500 mt-2">Customize how your dashboard looks for your team</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 text-black">
                <div className="lg:col-span-2">
                    <form action={updateBranding} className="space-y-8 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Company Display Name</label>
                            <input
                                name="companyName"
                                defaultValue={branding?.companyName || tenant?.name}
                                required
                                className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Logo URL</label>
                            <input
                                name="logoUrl"
                                defaultValue={branding?.logo || ''}
                                placeholder="https://example.com/logo.png"
                                className="w-full bg-slate-50 border-0 rounded-2xl px-6 py-4 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                            />
                            <p className="text-xs text-slate-400">Use a transparent PNG or SVG for best results.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Primary Color</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        name="primaryColor"
                                        defaultValue={branding?.primaryColor || '#10b981'}
                                        className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        defaultValue={branding?.primaryColor || '#10b981'}
                                        className="flex-1 bg-slate-50 border-0 rounded-2xl px-4 py-3 text-slate-900 outline-none"
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">Secondary Color</label>
                                <div className="flex gap-4 items-center">
                                    <input
                                        type="color"
                                        name="secondaryColor"
                                        defaultValue={branding?.secondaryColor || '#059669'}
                                        className="w-12 h-12 rounded-xl border-0 cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        defaultValue={branding?.secondaryColor || '#059669'}
                                        className="flex-1 bg-slate-50 border-0 rounded-2xl px-4 py-3 text-slate-900 outline-none"
                                        readOnly
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-slate-50 flex gap-4">
                            {canEdit ? (
                                <button
                                    type="submit"
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Save Branding Settings
                                </button>
                            ) : (
                                <div className="flex-1 bg-slate-100 text-slate-400 py-4 rounded-2xl font-bold text-center cursor-not-allowed">
                                    View Only Mode
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-3xl p-8 text-white">
                        <h3 className="text-lg font-bold mb-4">Preview</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/5">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: branding?.primaryColor || '#10b981' }}
                                >
                                    <span className="font-bold text-xs">H</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold leading-none">{branding?.companyName || tenant?.name}</span>
                                    <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest mt-1">Enterprise</span>
                                </div>
                            </div>

                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className="h-full w-2/3"
                                    style={{ backgroundColor: branding?.primaryColor || '#10b981' }}
                                ></div>
                            </div>

                            <div
                                className="py-2 px-4 rounded-xl text-center text-xs font-bold"
                                style={{ backgroundColor: branding?.primaryColor || '#10b981' }}
                            >
                                Sample Button
                            </div>
                        </div>
                    </div>

                    <div className="bg-emerald-50 rounded-3xl p-8 border border-emerald-100">
                        <h3 className="text-emerald-900 font-bold mb-2">Pro Tip</h3>
                        <p className="text-emerald-800 text-sm leading-relaxed">
                            Your branding affects the sidebar, login page, and automated email reports sent to your team.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
