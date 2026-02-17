import { getTitles } from '@/app/actions/title';
import Link from 'next/link';
import { ChevronLeft, Briefcase } from 'lucide-react';
import { TitleForm } from '@/components/TitleForm';
import { requirePermission } from '@/lib/rbac';

export default async function NewTitlePage() {
    await requirePermission('titles:edit');
    const titles = await getTitles();

    return (
        <div className="max-w-2xl mx-auto p-8">
            <Link href="/admin/titles" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Titles
            </Link>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Create New Title</h1>
                        <p className="text-sm text-slate-500">Define a new job title and its reporting manager title.</p>
                    </div>
                </div>

                <TitleForm titles={titles} />
            </div>
        </div>
    );
}
