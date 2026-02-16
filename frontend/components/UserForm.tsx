// components/UserForm.tsx
'use client';

import React, { useState } from 'react';
import { UserPlus, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface UserFormProps {
    editingUser: any;
    updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
    createAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
}

export function UserForm({ editingUser, updateAction, createAction }: UserFormProps) {
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
                if (editingUser) {
                    router.push('/admin/users'); // Go back to list mode
                } else {
                    event.currentTarget.reset(); // Clear form for new entry
                }
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
                        name="title"
                        defaultValue={editingUser?.title || ''}
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    >
                        <option value="">Select Title...</option>
                        <option value="Accountable Lead">Accountable Lead</option>
                        <option value="CS Manager">CS Manager</option>
                        <option value="System Architect">System Architect</option>
                        <option value="Executive">Executive</option>
                        <option value="IT Support Specialist">IT Support Specialist</option>
                        <option value="Manager">Manager</option>
                        <option value="Director">Director</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Role</label>
                    <select
                        name="role"
                        defaultValue={editingUser?.role || 'VIEWER'}
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    >
                        <option value="VIEWER">Viewer</option>
                        <option value="MANAGER">Manager</option>
                        <option value="EXECUTIVE">Executive</option>
                        <option value="ADMIN">Admin</option>
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
