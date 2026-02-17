'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { createRole, updateRole } from '@/app/actions/role';
import { Save, Loader2, Link } from 'lucide-react';

// Define available permissions grouped by category
const PERMISSION_GROUPS = [
    {
        name: 'Dashboard',
        permissions: [
            { id: 'dashboard', label: 'Overview', hasEdit: false },
            { id: 'clients', label: 'Clients', hasEdit: true },
            { id: 'performance', label: 'Performance', hasEdit: true },
            { id: 'strategy', label: 'Strategy', hasEdit: true },
        ]
    },
    {
        name: 'System',
        permissions: [
            { id: 'users', label: 'User Management', hasEdit: true },
            { id: 'roles', label: 'Role Management', hasEdit: true },
            { id: 'titles', label: 'Titles', hasEdit: true },
            { id: 'org_chart', label: 'Org Chart', hasEdit: true },
            { id: 'recycle_bin', label: 'Recycle Bin', hasEdit: true },
            { id: 'settings', label: 'Settings', hasEdit: true },
        ]
    }
];

// Flatten for easier processing in some parts
const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(g =>
    g.permissions.flatMap(p => p.hasEdit ? [`${p.id}:view`, `${p.id}:edit`] : [`${p.id}:view`])
);

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
        setSelectedPermissions(prev => {
            let next = prev.includes(key)
                ? prev.filter(p => p !== key)
                : [...prev, key];

            // Auto-check view if edit is checked
            if (key.endsWith(':edit') && next.includes(key)) {
                const viewKey = key.replace(':edit', ':view');
                if (!next.includes(viewKey)) next.push(viewKey);
            }

            // Auto-uncheck edit if view is unchecked
            if (key.endsWith(':view') && !next.includes(key)) {
                const editKey = key.replace(':view', ':edit');
                next = next.filter(p => p !== editKey);
            }

            return next;
        });
    };

    const handleSelectAll = () => {
        if (selectedPermissions.length === ALL_PERMISSION_KEYS.length) {
            setSelectedPermissions([]);
        } else {
            setSelectedPermissions([...ALL_PERMISSION_KEYS]);
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
                        {selectedPermissions.length === ALL_PERMISSION_KEYS.length ? 'Deselect All' : 'Select All'}
                    </button>
                </div>

                <div className="space-y-8">
                    {PERMISSION_GROUPS.map((group) => (
                        <div key={group.name} className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">{group.name}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {group.permissions.map((perm) => (
                                    <div
                                        key={perm.id}
                                        className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 flex items-center justify-between"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800 text-sm">{perm.label}</span>
                                            <span className="text-[10px] text-slate-400 font-mono mt-0.5">{perm.id}</span>
                                        </div>

                                        <div className="flex items-center gap-6">
                                            {/* View Permission */}
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPermissions.includes(`${perm.id}:view`)}
                                                    onChange={() => handlePermissionChange(`${perm.id}:view`)}
                                                    className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                />
                                                <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">View</span>
                                            </label>

                                            {/* Edit Permission (Conditional) */}
                                            {perm.hasEdit && (
                                                <label className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.includes(`${perm.id}:edit`)}
                                                        onChange={() => handlePermissionChange(`${perm.id}:edit`)}
                                                        className="h-4 w-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-xs font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">Edit</span>
                                                </label>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
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
