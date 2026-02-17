import { RoleForm } from '@/components/RoleForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/rbac';

export default async function NewRolePage() {
    await requirePermission('roles:edit');
    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Link href="/admin/roles" className="text-slate-500 hover:text-indigo-600 font-semibold mb-2 inline-flex items-center gap-1 text-sm">
                    <ArrowLeft className="h-4 w-4" /> Back to Roles
                </Link>
                <h1 className="text-3xl font-bold text-slate-800">Create New Role</h1>
                <p className="text-slate-500 mt-1">Define capabilities for a new role.</p>
            </div>

            <RoleForm />
        </div>
    );
}
