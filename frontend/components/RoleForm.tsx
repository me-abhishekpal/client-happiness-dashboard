'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createRole, updateRole } from '@/app/actions/role';
import { Save, Loader2, Link } from 'lucide-react';

// Define available permissions
const AVAILABLE_PERMISSIONS = [
    { key: 'dashboard', label: 'View Dashboard' },
    { key: 'admin_users', label: 'Manage Users' },
    { key: 'admin_roles', label: 'Manage Roles' },
    { key: 'admin_recycle_bin', label: 'Access Recycle Bin' },
    { key: 'clients_read', label: 'View Clients' },
    { key: 'clients_write', label: 'Manage Clients' },
    { key: 'reports', label: 'View Reports' },
];

interface RoleFormProps {
    role?: {
        id: string;
        name: string;
        description: string | null;
        permissions: string;
    };
}

export function RoleForm({ role }: RoleFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Parse existing permissions or default to empty
    const initialPermissions = role ? JSON.parse(role.permissions) : [];
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions);

    const handlePermissionChange = (key: string) => {
        setSelectedPermissions(prev =>
            prev.includes(key)
                ? prev.filter(p => p !== key)
                : [...prev, key]
        );
    };

    const handleSelectAll = () => {
        if (selectedPermissions.length === AVAILABLE_PERMISSIONS.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions(AVAILABLE_PERMISSIONS.map(p => p.key));
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        // Add JSON stringified permissions
        formData.set('permissions', JSON.stringify(selectedPermissions));

        if (role) {
            formData.append('roleId', role.id);
        }

        const action = role ? updateRole : createRole;

        try {
            const result = await action(formData);
            if (result.success) {
                toast.success(role ? 'Role updated' : 'Role created');
                router.push('/admin/roles');
            } else {
                toast.error(result.error || 'Operation failed');
            }
        } catch (err) {
            toast.error('System error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
            {/* Basic Info */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                    Basic Information
                </h3>
                <div className="grid gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Role Name</label>
                        <input
                            name="name"
                            defaultValue={role?.name}
                            required
                            placeholder="e.g. Compliance Officer"
                            className="w-full px-4 py-2 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                        <textarea
                            name="description"
                            defaultValue={role?.description || ''}
                            placeholder="Describe what this role is for..."
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50"
                        />
                    </div>
                </div>
            </div>

            {/* Permissions */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                        Access Control
                    </h3>
                    <button
                        type="button"
                        onClick={handleSelectAll}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 uppercase tracking-wider"
                    >
                        {selectedPermissions.length === AVAILABLE_PERMISSIONS.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {AVAILABLE_PERMISSIONS.map((perm) => (
                        <label
                            key={perm.key}
                            className={`
                                relative flex items-start p-4 rounded-xl border cursor-pointer transition-all
                                ${selectedPermissions.includes(perm.key)
                                    ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                                    : 'bg-white border-slate-100 hover:border-slate-300'}
                            `}
                        >
                            <div className="flex items-center h-5">
                                <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(perm.key)}
                                    onChange={() => handlePermissionChange(perm.key)}
                                    className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="ml-3 text-sm">
                                <span className={`font-bold block ${selectedPermissions.includes(perm.key) ? 'text-indigo-900' : 'text-slate-700'}`}>
                                    {perm.label}
                                </span>
                                <span className="text-xs text-slate-400 font-mono mt-0.5 block">{perm.key}</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={() => router.push('/admin/roles')}
                    className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {role ? 'Save Changes' : 'Create Role'}
                </button>
            </div>
        </form>
    );
}
