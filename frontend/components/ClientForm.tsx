
'use client';

import React, { useState } from 'react';
import { UserPlus, Pencil } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

import { SearchableSelect } from '@/components/ui/SearchableSelect';

interface ClientFormProps {
    editingClient: any;
    users: { id: string; name: string; email: string; role: string }[];
    departments: { id: string; name: string }[];
    services: { id: string; name: string }[];
    engagements: { id: string; name: string }[];
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
                className="w-full text-left bg-slate-50 border-0 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
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

export function ClientForm({ editingClient, users, departments, services = [], engagements = [], updateAction, createAction }: ClientFormProps) {
    const [loading, setLoading] = useState(false);
    const [ragStatus, setRagStatus] = useState(editingClient?.status || 'UNKNOWN');
    const [engagementStatus, setEngagementStatus] = useState(editingClient?.engagementStatus || 'OPEN');
    const [deptId, setDeptId] = useState(editingClient?.departmentId || departments[0]?.id || '');
    const router = useRouter();

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

            <form onSubmit={handleSubmit} className="space-y-6">
                {editingClient && <input type="hidden" name="clientId" value={editingClient.id} />}

                <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Client Name</label>
                    <input
                        name="name"
                        defaultValue={editingClient?.name || ''}
                        placeholder="e.g. Acme Corp"
                        required
                        disabled={!!editingClient}
                        className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Service Type (Single Select)</label>
                        <SearchableSelect
                            name="serviceId"
                            value={editingClient?.serviceId || ''}
                            options={services.map(s => ({ value: s.id, label: s.name }))}
                            placeholder="Select Service..."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Current Engagement</label>
                        <SearchableSelect
                            name="engagementId"
                            value={editingClient?.engagementId || ''}
                            options={engagements.map(e => ({ value: e.id, label: e.name }))}
                            placeholder="Select Engagement..."
                        />
                    </div>
                </div>

                {/* Revenue & Engagement Status Row */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Revenue (ARR)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                            <input
                                type="number"
                                name="revenue"
                                defaultValue={editingClient?.revenue || ''}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full pl-8 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Engagement Status</label>
                        <SearchableSelect
                            name="engagementStatus"
                            value={engagementStatus}
                            onChange={setEngagementStatus}
                            options={[
                                { value: 'OPEN', label: 'OPEN' },
                                { value: 'ONGOING', label: 'ONGOING' },
                                { value: 'CLOSED', label: 'CLOSED' },
                            ]}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">RAG Status</label>
                        <SearchableSelect
                            name="status"
                            value={ragStatus}
                            onChange={setRagStatus}
                            options={[
                                { value: 'GREEN', label: 'GREEN – Healthy' },
                                { value: 'AMBER', label: 'AMBER – At Risk' },
                                { value: 'RED', label: 'RED – Critical' },
                                { value: 'UNKNOWN', label: 'UNKNOWN' },
                            ]}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">CSM Name</label>
                        <SearchableSelect
                            name="csmId"
                            value={editingClient?.csmId || ''}
                            options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
                            placeholder="Assign CSM..."
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">PM/TPM Name</label>
                        <SearchableSelect
                            name="pmId"
                            value={editingClient?.pmId || ''}
                            options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
                            placeholder="Assign PM..."
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">AM Name</label>
                        <SearchableSelect
                            name="amId"
                            value={editingClient?.amId || ''}
                            options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
                            placeholder="Assign AM..."
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">vCISO Name</label>
                        <SearchableSelect
                            name="vcisoId"
                            value={editingClient?.vcisoId || ''}
                            options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
                            placeholder="Assign vCISO..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Department</label>
                        <SearchableSelect
                            name="departmentId"
                            value={deptId}
                            onChange={setDeptId}
                            options={departments.map(d => ({ value: d.id, label: d.name }))}
                            placeholder="Select Department..."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Owner</label>
                        <SearchableSelect
                            name="ownerId"
                            value={editingClient?.ownerId || ''}
                            options={users.map(u => ({ value: u.id, label: `${u.name || u.email} (${u.role})` }))}
                            placeholder="Select Owner..."
                        />
                    </div>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Accountable (Vertical Head)</label>
                    <SearchableSelect
                        name="accountableId"
                        value={editingClient?.accountableId || ''}
                        options={users.map(u => ({ value: u.id, label: `${u.name || u.email} (${u.role})` }))}
                        placeholder="Select Accountable..."
                    />
                </div>

                <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Next Steps / Action Items</label>
                        <textarea
                            name="nextSteps"
                            defaultValue={editingClient?.nextSteps || ''}
                            rows={2}
                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Comments (CSM/PM)</label>
                        <textarea
                            name="csmPmComments"
                            defaultValue={editingClient?.csmPmComments || ''}
                            rows={2}
                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Comments (Executive)</label>
                        <textarea
                            name="executiveComments"
                            defaultValue={editingClient?.executiveComments || ''}
                            rows={2}
                            className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full text-white py-4 px-4 rounded-xl font-black shadow-lg shadow-emerald-200 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${loading ? 'bg-emerald-400 cursor-not-allowed' :
                        'bg-emerald-600 hover:bg-emerald-700'
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
