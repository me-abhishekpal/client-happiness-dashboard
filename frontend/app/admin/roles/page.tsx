import { getRoles, deleteRole } from '@/app/actions/role';
import Link from 'next/link';
import { Shield, Plus, Pencil, Trash2, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { RoleDeleteButton } from '@/components/RoleDeleteButton';
import { requirePermission, hasPermission } from '@/lib/rbac';

export default async function RolesPage() {
    await requirePermission('roles:view');
    const canEdit = await hasPermission('roles:edit');
    const roles = await getRoles();

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Shield className="h-8 w-8 text-indigo-500" />
                        Role Management
                    </h1>
                    <p className="text-slate-500 mt-2">Create and manage custom roles and their permissions.</p>
                </div>
                {canEdit && (
                    <Link
                        href="/admin/roles/new"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" /> Create New Role
                    </Link>
                )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role Name</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Users</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {roles.map((role) => (
                                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{role.name}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600">{role.description || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                            <Users className="h-3 w-3" />
                                            {role._count.users}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-3">
                                            <Link
                                                href={`/admin/roles/${role.id}`}
                                                className="text-slate-400 hover:text-indigo-600 transition-colors"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Link>

                                            {/* Prevent deleting core roles if needed, or rely on backend check */}
                                            {role._count.users === 0 ? (
                                                <RoleDeleteButton id={role.id} />
                                            ) : (
                                                <span className="text-slate-200 cursor-not-allowed" title="Cannot delete role with assigned users">
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
        </div>
    );
}

