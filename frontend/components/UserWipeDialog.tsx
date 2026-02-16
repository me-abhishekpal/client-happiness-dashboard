'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getWipeConflicts, getPotentialSuccessors, wipeUserWithReassignment, hardDeleteUser } from '@/app/actions/user';

interface UserWipeDialogProps {
    userId: string;
    userName?: string;
}

export function UserWipeDialog({ userId, userName = 'this user' }: UserWipeDialogProps) {
    const [confirmWipe, setConfirmWipe] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [conflicts, setConflicts] = useState({ owned: 0, accountable: 0 });
    const [successors, setSuccessors] = useState<{ id: string; name: string | null; role: string }[]>([]);
    const [selectedSuccessor, setSelectedSuccessor] = useState('');

    const handleInitialClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        setConfirmWipe(true);
    };

    const proceedWithWipe = async () => {
        setConfirmWipe(false);
        setLoading(true);
        try {
            // 1. Check for conflicts
            const result = await getWipeConflicts(userId);
            if (result.owned === 0 && result.accountable === 0) {
                // Safe to simple wipe
                const formData = new FormData();
                formData.append('userId', userId);
                const deleteResult = await hardDeleteUser(formData);

                // Handle void or object return from legacy action
                if (deleteResult && typeof deleteResult === 'object' && !deleteResult.success) {
                    toast.error(deleteResult.error || 'Wipe failed');
                } else {
                    toast.success('User wiped successfully');
                }
            } else {
                // Conflicts found - open dialog
                setConflicts(result);
                const users = await getPotentialSuccessors(userId);
                setSuccessors(users);
                setIsOpen(true);
            }
        } catch (error) {
            toast.error('Failed to check user dependencies.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleReassignAndWipe = async () => {
        if (!selectedSuccessor) return toast.error('Please select a successor');

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('userId', userId);
            formData.append('successorId', selectedSuccessor);

            const result = await wipeUserWithReassignment(formData);
            if (result.success) {
                toast.success('User reassigned and wiped successfully');
                setIsOpen(false);
            } else {
                toast.error(result.error || 'Operation failed');
            }
        } catch (error) {
            toast.error('System error during wipe.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="inline-block relative">
            {confirmWipe ? (
                <div className="absolute right-0 bottom-full mb-2 z-10 w-48 bg-white p-3 rounded-xl shadow-xl border border-red-100 flex flex-col gap-2 animate-in slide-in-from-bottom-2 duration-200">
                    <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Confirm Permanent Wipe?</p>
                    <div className="flex gap-2">
                        <button
                            onClick={proceedWithWipe}
                            disabled={loading}
                            className="flex-1 bg-red-600 text-white text-xs py-1.5 rounded-md font-bold hover:bg-red-700 disabled:opacity-50"
                        >
                            {loading ? '...' : 'Yes, Wipe'}
                        </button>
                        <button
                            onClick={() => setConfirmWipe(false)}
                            className="flex-1 bg-slate-100 text-slate-600 text-xs py-1.5 rounded-md font-bold hover:bg-slate-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleInitialClick}
                    disabled={loading}
                    className="text-red-400 hover:text-red-600 font-medium inline-flex items-center disabled:opacity-50 transition-colors"
                >
                    <Trash2 className="h-4 w-4 mr-1" /> Wipe
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100">
                        {/* Header */}
                        <div className="bg-amber-50 p-6 border-b border-amber-100 flex items-start gap-4">
                            <div className="bg-amber-100 p-2 rounded-lg shrink-0">
                                <AlertTriangle className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-amber-900">Action Required</h3>
                                <p className="text-sm text-amber-700 mt-1">
                                    {userName} still manages active clients. You must reassign them before wiping.
                                </p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-6">
                            <div className="flex gap-4 text-sm">
                                <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <div className="text-2xl font-bold text-slate-700">{conflicts.owned}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Owned Clients</div>
                                </div>
                                <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                                    <div className="text-2xl font-bold text-slate-700">{conflicts.accountable}</div>
                                    <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Accountable</div>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <ArrowRight className="text-slate-300 rotate-90" />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                    Select Successor
                                </label>
                                <div className="relative">
                                    <select
                                        value={selectedSuccessor}
                                        onChange={(e) => setSelectedSuccessor(e.target.value)}
                                        className="block w-full pl-10 pr-4 py-3 border-slate-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    >
                                        <option value="">Choose a new owner...</option>
                                        {successors.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.name || 'Unnamed'} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                    <UserCheck className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Dependencies will be transferred to this user. Historical logs will be deleted.
                                </p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-slate-50 p-4 flex justify-end gap-3 border-t border-slate-100">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleReassignAndWipe}
                                disabled={loading || !selectedSuccessor}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-red-200"
                            >
                                {loading ? 'Processing...' : 'Transfer & Wipe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
