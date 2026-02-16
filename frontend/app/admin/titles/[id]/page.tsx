import { getTitles, getTitleById } from '@/app/actions/title';
import Link from 'next/link';
import { ChevronLeft, Briefcase } from 'lucide-react';
import { TitleForm } from '@/components/TitleForm';
import { notFound } from 'next/navigation';

export default async function EditTitlePage({ params }: { params: { id: string } }) {
    const title = await getTitleById(params.id);
    const allTitles = await getTitles();

    if (!title) {
        notFound();
    }

    return (
        <div className="max-w-2xl mx-auto p-8">
            <Link href="/admin/titles" className="inline-flex items-center text-slate-500 hover:text-slate-800 mb-6 transition-colors font-medium">
                <ChevronLeft className="w-4 h-4 mr-1" /> Back to Titles
            </Link>

            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Edit Title</h1>
                        <p className="text-sm text-slate-500">Update job title details and hierarchy.</p>
                    </div>
                </div>

                <TitleForm titles={allTitles} initialData={title} />
            </div>
        </div>
    );
}
