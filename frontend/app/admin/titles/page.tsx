import { getTitles, deleteTitle } from '@/app/actions/title';
import Link from 'next/link';
import { Briefcase, Plus, Trash2, Users } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { TitleDeleteButton } from '@/components/TitleDeleteButton';
import { requirePermission } from '@/lib/rbac';

export default async function TitlesPage() {
    await requirePermission('admin_roles'); // Re-using roles permission for now
    const titles = await getTitles();

    return (
        <div className="max-w-5xl mx-auto p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Briefcase className="h-8 w-8 text-emerald-600" />
                        Title Management
                    </h1>
                    <p className="text-slate-500 mt-2">Standardize job titles and hierarchy levels.</p>
                </div>
                <Link
                    href="/admin/titles/new"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" /> Add Title
                </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-left">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Title Name</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reports To</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Users Assigned</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {titles.map((title) => (
                            <tr key={title.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{title.name}</div>
                                </td>
                                <td className="px-6 py-4">
                                    {title.reportsTo ? (
                                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium">
                                            <Briefcase className="h-3 w-3" />
                                            {title.reportsTo.name}
                                        </div>
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">Top Level</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                        <Users className="h-3 w-3" />
                                        {title._count.users}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <Link
                                            href={`/admin/titles/${title.id}`}
                                            className="text-slate-400 hover:text-blue-600 transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                                        </Link>
                                        {title._count.users === 0 ? (
                                            <TitleDeleteButton id={title.id} />
                                        ) : (
                                            <span className="text-slate-200 cursor-not-allowed" title="Cannot delete title with assigned users">
                                                <Trash2 className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
