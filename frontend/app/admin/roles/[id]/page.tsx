import { getRole } from '@/app/actions/role';
import { RoleForm } from '@/components/RoleForm';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default async function EditRolePage({ params }: { params: { id: string } }) {
    const role = await getRole(params.id);

    if (!role) {
        notFound();
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/roles" className="text-slate-500 hover:text-indigo-600 font-semibold mb-2 inline-flex items-center gap-1 text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back to Roles
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Edit Role: {role.name}</h1>
                <p className="text-slate-500 mt-1">Modify permissions and details.</p>
            </div>

            <RoleForm role={role} />
        </div>
    );
}
