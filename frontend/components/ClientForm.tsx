
'use client';

import React, { useState } from 'react';
import { UserPlus, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface ClientFormProps {
    editingClient: any;
    users: { id: string; name: string; role: string }[];
    departments: { id: string; name: string }[];
    potentialCSMs?: { id: string; name: string | null }[];
    potentialPMs?: { id: string; name: string | null }[];
    potentialAMs?: { id: string; name: string | null }[];
    updateAction: (formData: FormData) => Promise<void>;
    createAction: (formData: FormData) => Promise<void>;
}

const ENGAGEMENT_TYPES = [
    "SOC",
    "NOC",
    "Vulnerability Assessment and Management Services",
    "Penetration Testing Services",
    "GLBA Security Assessment Services",
    "Remediation Services",
    "vCISO",
    "CIO",
    "ITO",
    "Managed Infrastructure Services",
    "Hosting Services",
    "Managed Enterprise Services",
    "ERP Assessment Services",
    "Banner Managed Services and DBA Support",
    "SQL Database Administration",
    "PL-SQL Professional Services",
    "Helpdesk and Desktop Support Services",
    "SSO Provisioning Services",
    "IT Project Management Services",
    "Professional Security and Compliance Consulting Services"
];

const SERVICE_TYPES = [
    "MEA",
    "ITO",
    "MSS",
    "QL",
    "MIS",
    "SOC as a Service",
    "vCISO",
    "BBH"
];

// Multi-select component for Service Types
function ServiceTypeMultiSelect({ defaultValue }: { defaultValue: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<string[]>(() => {
        return defaultValue ? defaultValue.split(', ').filter(Boolean) : [];
    });

    const toggleOption = (option: string) => {
        setSelected(prev =>
            prev.includes(option)
                ? prev.filter(o => o !== option)
                : [...prev, option]
        );
    };

    return (
        <div className="relative">
            <input
                type="hidden"
                name="serviceType"
                value={selected.join(', ')}
            />
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="block w-full text-left border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50 px-3 py-2"
            >
                {selected.length === 0 ? (
                    <span className="text-slate-400">Select Service Types...</span>
                ) : (
                    <span>{selected.join(', ')}</span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                        {SERVICE_TYPES.map(type => (
                            <label
                                key={type}
                                className="flex items-center px-3 py-2 hover:bg-slate-50 cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(type)}
                                    onChange={() => toggleOption(type)}
                                    className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm">{type}</span>
                            </label>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export function ClientForm({ editingClient, users, departments, potentialCSMs = [], potentialPMs = [], potentialAMs = [], updateAction, createAction }: ClientFormProps) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    console.log("ClientForm - users prop:", users.length, users.map(u => ({ id: u.id, name: u.name, role: u.role })));
    console.log("ClientForm - potentialCSMs:", potentialCSMs.length);
    console.log("ClientForm - potentialPMs:", potentialPMs.length);
    console.log("ClientForm - potentialAMs:", potentialAMs.length); // Added console.log for potentialAMs

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);

        const formData = new FormData(event.currentTarget);
        // Add ID if editing
        if (editingClient) {
            formData.append('clientId', editingClient.id);
        }

        const action = editingClient ? updateAction : createAction;

        try {
            await action(formData);
            toast.success(editingClient ? 'Client updated successfully' : 'Client created successfully');
            if (editingClient) {
                router.push('/admin/clients');
            } else {
                event.currentTarget.reset();
            }
        } catch (error: any) {
            // Ignore redirect error
            if (error.message === 'NEXT_REDIRECT') {
                return;
            }
            toast.error('Operation failed: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-8">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center text-slate-800">
                    {editingClient ? (
                        <>
                            <Pencil className="h-5 w-5 mr-2 text-orange-500" /> Edit Client
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-5 w-5 mr-2 text-blue-500" /> Add New Client
                        </>
                    )}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {editingClient && <input type="hidden" name="clientId" value={editingClient.id} />}

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Client Name</label>
                    <input
                        name="name"
                        defaultValue={editingClient?.name || ''}
                        placeholder="e.g. Acme Corp"
                        required
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Service Type (Multi-Select)</label>
                        <ServiceTypeMultiSelect
                            defaultValue={editingClient?.serviceType || ''}
                        />
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Engagement</label>
                        <select
                            name="currentEngagement"
                            defaultValue={editingClient?.currentEngagement || ''}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        >
                            <option value="">Select Engagement...</option>
                            {ENGAGEMENT_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Engagement Status</label>
                        <select
                            name="engagementStatus"
                            defaultValue={editingClient?.engagementStatus || 'OPEN'}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        >
                            <option value="OPEN">OPEN</option>
                            <option value="ONGOING">ONGOING</option>
                            <option value="CLOSED">CLOSED</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">CSM Name</label>
                        <select
                            name="csmName"
                            defaultValue={editingClient?.csmName || ''}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        >
                            <option value="">Select CSM...</option>
                            {potentialCSMs.length > 0 ? (
                                potentialCSMs.map(u => (
                                    <option key={u.id} value={u.name || ''}>{u.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>No CSMs found</option>
                            )}
                            {/* Fallback if current value is not in list */}
                            {editingClient?.csmName && !potentialCSMs.find(u => u.name === editingClient.csmName) && (
                                <option value={editingClient.csmName}>{editingClient.csmName}</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">PM/TPM Name</label>
                        <select
                            name="pmName"
                            defaultValue={editingClient?.pmName || ''}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        >
                            <option value="">Select PM...</option>
                            {potentialPMs.length > 0 ? (
                                potentialPMs.map(u => (
                                    <option key={u.id} value={u.name || ''}>{u.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>No PMs found</option>
                            )}
                            {/* Fallback if current value is not in list */}
                            {editingClient?.pmName && !potentialPMs.find(u => u.name === editingClient.pmName) && (
                                <option value={editingClient.pmName}>{editingClient.pmName}</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">AM Name</label>
                        <select
                            name="amName"
                            defaultValue={editingClient?.amName || ''}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        >
                            <option value="">Select AM...</option>
                            {potentialAMs.length > 0 ? (
                                potentialAMs.map(u => (
                                    <option key={u.id} value={u.name || ''}>{u.name}</option>
                                ))
                            ) : (
                                <option value="" disabled>No AMs found</option>
                            )}
                            {editingClient?.amName && !potentialAMs.find(u => u.name === editingClient.amName) && (
                                <option value={editingClient.amName}>{editingClient.amName}</option>
                            )}
                        </select>
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">vCISO Name</label>
                        <input
                            name="vcisoName"
                            defaultValue={editingClient?.vcisoName || ''}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Department</label>
                        <select
                            name="departmentId"
                            defaultValue={editingClient?.departmentId || ''}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        >
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Owner</label>
                        <select
                            name="ownerId"
                            defaultValue={editingClient?.ownerId || ''}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        >
                            <option value="">Select Owner...</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Accountable (Vertical Head)</label>
                    <select
                        name="accountableId"
                        defaultValue={editingClient?.accountableId || ''}
                        className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                    >
                        <option value="">Select Accountable...</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Next Steps / Action Items</label>
                        <textarea
                            name="nextSteps"
                            defaultValue={editingClient?.nextSteps || ''}
                            rows={2}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comments (CSM/PM)</label>
                        <textarea
                            name="csmPmComments"
                            defaultValue={editingClient?.csmPmComments || ''}
                            rows={2}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        />
                    </div>
                    <div>
                        <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Comments (Executive)</label>
                        <textarea
                            name="executiveComments"
                            defaultValue={editingClient?.executiveComments || ''}
                            rows={2}
                            className="block w-full border-slate-200 rounded-xl shadow-sm sm:text-sm focus:ring-blue-500 focus:border-blue-500 bg-slate-50/50"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-2.5 px-4 rounded-xl font-bold shadow-lg transition-all duration-300 ${loading ? 'bg-slate-400 cursor-not-allowed' :
                        editingClient ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-100' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-100'
                        }`}
                >
                    {loading ? 'Processing...' : editingClient ? 'Update Client' : 'Create Client'}
                </button>

                {editingClient && (
                    <button
                        type="button"
                        onClick={() => router.push('/admin/clients')}
                        className="block w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 mt-2 uppercase tracking-widest"
                    >
                        Cancel Edit
                    </button>
                )}
            </form>
        </div>
    );
}
