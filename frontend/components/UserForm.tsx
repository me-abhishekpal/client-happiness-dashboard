// components/UserForm.tsx
'use client';

import React, { useState } from 'react';
import { UserPlus, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface UserFormProps {
    editingUser: any;
    roles: { id: string; name: string }[];
    titles: { id: string; name: string }[];
    managers: { id: string; name: string }[];
    updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
    createAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function UserForm({ editingUser, roles, titles, managers, updateAction, createAction }: UserFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        const action = editingUser ? updateAction : createAction;

        try {
            const result = await action(formData);
            if (result.success) {
                toast.success(editingUser ? 'User updated successfully' : 'User created successfully');
                // Always navigate to clear form state properly
                router.push('/admin/users');
            } else {
                toast.error(result.error || 'Operation failed');
            }
        } catch (error) {
            toast.error('A system error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center text-slate-800">
                    {editingUser ? (
                        <>
                            <Pencil className="h-5 w-5 mr-2 text-orange-500" /> Edit User
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-5 w-5 mr-2 text-blue-500" /> Add New User
                        </>
                    )}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {editingUser && <input type="hidden" name="userId" value={editingUser.id} />}

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                        name="name"
                        defaultValue={editingUser?.name || ''}
                        placeholder="John Doe"
                        required
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email Address</label>
                    <input
                        name="email"
                        type="email"
                        defaultValue={editingUser?.email || ''}
                        placeholder="john@example.com"
                        required
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    />
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Job Title</label>
                    <select
                        name="titleId"
                        defaultValue={editingUser?.titleId || ''}
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    >
                        <option value="">Select Title...</option>
                        {titles.map(title => (
                            <option key={title.id} value={title.id}>{title.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Manager</label>
                    <select
                        name="managerId"
                        defaultValue={editingUser?.managerId || ''}
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    >
                        <option value="">No Manager (Top Level)</option>
                        {managers
                            .filter(m => m.id !== editingUser?.id) // Prevent self-assignment
                            .map(manager => (
                                <option key={manager.id} value={manager.id}>{manager.name}</option>
                            ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role</label>
                    <select
                        name="roleId"
                        defaultValue={editingUser?.roleId || ''}
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        required
                    >
                        <option value="">Select Role...</option>
                        {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                        ))}
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-2.5 px-4 rounded-xl font-bold shadow-lg transition-all duration-300 ${loading ? 'bg-slate-400 cursor-not-allowed' :
                        editingUser ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                        }`}
                >
                    {loading ? 'Processing...' : editingUser ? 'Update User Account' : 'Create User Account'}
                </button>

                {editingUser && (
                    <button
                        type="button"
                        onClick={() => router.push('/admin/users')}
                        className="block w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 mt-2 uppercase tracking-widest"
                    >
                        Cancel Edit
                    </button>
                )}
            </form>
        </div>
    );
}
