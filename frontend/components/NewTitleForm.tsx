'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createTitle } from '@/app/actions/title';
import { Save } from 'lucide-react';
import Link from 'next/link';

export function NewTitleForm({ titles }: { titles: any[] }) {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsSubmitting(true);
        const result = await createTitle(formData);
        setIsSubmitting(false);

        if (result.success) {
            toast.success('Title created successfully');
            router.push('/admin/titles');
        } else {
            toast.error(result.error || 'Failed to create title');
        }
    }

    return (
        <form action={handleSubmit} className="p-8 space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Title Name</label>
                <input
                    name="name"
                    type="text"
                    placeholder="e.g. Senior Product Manager"
                    required
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium text-slate-800 placeholder:text-slate-400"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Reports To Title (Optional)</label>
                <div className="relative">
                    <select
                        name="reportsToId"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all outline-none font-medium text-slate-800 bg-white"
                    >
                        <option value="">None (Top Level)</option>
                        {titles.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    <p className="mt-2 text-xs text-slate-400">
                        Which title does this role usually report to? (e.g. Project Manager reports to Director)
                    </p>
                </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
                <Link
                    href="/admin/titles"
                    className="px-6 py-2.5 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </Link>
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? (
                        <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Save Title
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
