'use client';

import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Check, X, AlertTriangle, FileSignature } from 'lucide-react';
import { MultiSearchableSelect } from '@/components/ui/MultiSearchableSelect';

type Service = { id: string; name: string };
type Engagement = { id: string; name: string; services: Service[] };

type Actions = {
    createService: (fd: FormData) => Promise<void>;
    updateService: (fd: FormData) => Promise<void>;
    deleteService: (fd: FormData) => Promise<void>;
    createEngagement: (fd: FormData) => Promise<void>;
    updateEngagement: (fd: FormData) => Promise<void>;
    deleteEngagement: (fd: FormData) => Promise<void>;
};

// ─── MFA Delete Dialog ───────────────────────────────────────────────────────

function MfaDeleteDialog({
    label, onConfirm, onCancel,
}: { label: string; onConfirm: (mfaCode: string) => Promise<void>; onCancel: () => void }) {
    const [mfaCode, setMfaCode] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleDelete() {
        if (mfaCode.length !== 6) return;
        setLoading(true);
        try {
            await onConfirm(mfaCode);
            toast.success('Deleted successfully');
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm border border-red-100">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-red-900">MFA Verification Required</h3>
                        <p className="text-xs text-red-600 mt-0.5">Deleting: <span className="font-bold">{label}</span></p>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                    Enter your 6-digit authenticator code to confirm. All linked clients will be unlinked.
                </p>
                <input
                    type="text" inputMode="numeric" maxLength={6}
                    value={mfaCode} onChange={e => setMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full text-center tracking-[0.5em] font-mono text-2xl border-2 border-slate-200 rounded-xl py-3 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none mb-4"
                    autoFocus
                />
                <div className="flex gap-3">
                    <button onClick={handleDelete} disabled={mfaCode.length !== 6 || loading}
                        className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white text-sm font-black rounded-xl transition-all disabled:opacity-50">
                        {loading ? 'Deleting...' : 'Verify & Delete'}
                    </button>
                    <button onClick={onCancel}
                        className="flex-1 py-3 border border-slate-200 text-sm font-bold text-slate-600 rounded-xl hover:bg-slate-50 transition-all">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Shared action buttons ────────────────────────────────────────────────────

function EditActions({ onSave, onCancel, loading }: { onSave: () => void; onCancel: () => void; loading: boolean }) {
    return (
        <div className="flex items-center justify-end gap-2">
            <button onClick={onSave} disabled={loading}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors disabled:opacity-50">
                <Check className="h-4 w-4" />
            </button>
            <button onClick={onCancel}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="h-4 w-4" />
            </button>
        </div>
    );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
    return (
        <div className="flex items-center justify-end gap-2">
            <button onClick={onEdit}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-blue-100 hover:text-blue-600 transition-colors">
                <Pencil className="h-4 w-4" />
            </button>
            <button onClick={onDelete}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors">
                <Trash2 className="h-4 w-4" />
            </button>
        </div>
    );
}

// ─── Services Table ──────────────────────────────────────────────────────────

function ServicesTable({ services, actions }: { services: Service[]; actions: Actions }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(false);

    async function handleCreate() {
        if (!newName.trim()) return;
        setLoading(true);
        try {
            const fd = new FormData(); fd.append('name', newName.trim());
            await actions.createService(fd);
            setNewName(''); setAdding(false); toast.success('Service created');
        } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
    }

    async function handleUpdate(id: string) {
        if (!editName.trim()) return;
        setLoading(true);
        try {
            const fd = new FormData(); fd.append('id', id); fd.append('name', editName.trim());
            await actions.updateService(fd);
            setEditingId(null); toast.success('Service updated');
        } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
    }

    const deletingService = services.find(s => s.id === deletingId);

    return (
        <>
            {deletingId && deletingService && (
                <MfaDeleteDialog
                    label={deletingService.name}
                    onConfirm={async (mfaCode) => {
                        const fd = new FormData(); fd.append('id', deletingId); fd.append('mfaCode', mfaCode);
                        await actions.deleteService(fd); setDeletingId(null);
                    }}
                    onCancel={() => setDeletingId(null)}
                />
            )}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100 rounded-t-2xl">
                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-2xl">Service Name</th>
                            <th className="w-28 px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-2xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map(svc => (
                            <tr key={svc.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3">
                                    {editingId === svc.id ? (
                                        <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Enter') handleUpdate(svc.id); if (e.key === 'Escape') setEditingId(null); }}
                                            className="w-full bg-slate-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    ) : (
                                        <span className="font-medium text-slate-800">{svc.name}</span>
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {editingId === svc.id
                                        ? <EditActions onSave={() => handleUpdate(svc.id)} onCancel={() => setEditingId(null)} loading={loading} />
                                        : <RowActions onEdit={() => { setEditingId(svc.id); setEditName(svc.name); }} onDelete={() => setDeletingId(svc.id)} />}
                                </td>
                            </tr>
                        ))}
                        {adding ? (
                            <tr className="border-b border-slate-50 bg-emerald-50/30">
                                <td className="px-5 py-3">
                                    <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setAdding(false); }}
                                        placeholder="Service name..."
                                        className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </td>
                                <td className="px-4 py-3">
                                    <EditActions onSave={handleCreate} onCancel={() => setAdding(false)} loading={loading} />
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={2} className="px-5 py-3">
                                    <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                        <Plus className="h-4 w-4" /> Add Service
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ─── Engagements Table ────────────────────────────────────────────────────────

function EngagementsTable({ engagements, services, actions }: { engagements: Engagement[]; services: Service[]; actions: Actions }) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editServiceIds, setEditServiceIds] = useState<string[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [newName, setNewName] = useState('');
    const [newServiceIds, setNewServiceIds] = useState<string[]>([]);
    const [adding, setAdding] = useState(false);
    const [loading, setLoading] = useState(false);

    const serviceOptions = services.map(s => ({ value: s.id, label: s.name }));

    async function handleCreate() {
        if (!newName.trim()) return;
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('name', newName.trim());
            newServiceIds.forEach(id => fd.append('serviceIds', id));
            await actions.createEngagement(fd);
            setNewName(''); setNewServiceIds([]); setAdding(false);
            toast.success('Engagement created');
        } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
    }

    async function handleUpdate(id: string) {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append('id', id); fd.append('name', editName.trim());
            editServiceIds.forEach(sId => fd.append('serviceIds', sId));
            await actions.updateEngagement(fd);
            setEditingId(null); toast.success('Engagement updated');
        } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
    }

    const deletingEng = engagements.find(e => e.id === deletingId);

    return (
        <>
            {deletingId && deletingEng && (
                <MfaDeleteDialog
                    label={deletingEng.name}
                    onConfirm={async (mfaCode) => {
                        const fd = new FormData(); fd.append('id', deletingId); fd.append('mfaCode', mfaCode);
                        await actions.deleteEngagement(fd); setDeletingId(null);
                    }}
                    onCancel={() => setDeletingId(null)}
                />
            )}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tl-2xl">Engagement Name</th>
                            <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Linked Services</th>
                            <th className="w-28 px-5 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider rounded-tr-2xl">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {engagements.map(eng => (
                            <tr key={eng.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                <td className="px-5 py-3 align-top">
                                    {editingId === eng.id ? (
                                        <input autoFocus value={editName} onChange={e => setEditName(e.target.value)}
                                            onKeyDown={e => { if (e.key === 'Escape') setEditingId(null); }}
                                            className="w-full bg-slate-50 border-0 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                    ) : (
                                        <span className="font-medium text-slate-800">{eng.name}</span>
                                    )}
                                </td>
                                <td className="px-5 py-3 align-top">
                                    {editingId === eng.id ? (
                                        <MultiSearchableSelect
                                            values={editServiceIds}
                                            onChange={setEditServiceIds}
                                            options={serviceOptions}
                                            placeholder="Link services..."
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-1.5">
                                            {eng.services.length === 0
                                                ? <span className="text-slate-400 text-xs">None</span>
                                                : eng.services.map(s => (
                                                    <span key={s.id} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
                                                        {s.name}
                                                    </span>
                                                ))
                                            }
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 align-top">
                                    {editingId === eng.id
                                        ? <EditActions onSave={() => handleUpdate(eng.id)} onCancel={() => setEditingId(null)} loading={loading} />
                                        : <RowActions
                                            onEdit={() => { setEditingId(eng.id); setEditName(eng.name); setEditServiceIds(eng.services.map(s => s.id)); }}
                                            onDelete={() => setDeletingId(eng.id)} />}
                                </td>
                            </tr>
                        ))}
                        {adding ? (
                            <tr className="border-b border-slate-50 bg-emerald-50/30">
                                <td className="px-5 py-3 align-top">
                                    <input autoFocus value={newName} onChange={e => setNewName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Escape') setAdding(false); }}
                                        placeholder="Engagement name..."
                                        className="w-full bg-white border border-emerald-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
                                </td>
                                <td className="px-5 py-3 align-top">
                                    <MultiSearchableSelect
                                        values={newServiceIds}
                                        onChange={setNewServiceIds}
                                        options={serviceOptions}
                                        placeholder="Link services..."
                                    />
                                </td>
                                <td className="px-4 py-3 align-top">
                                    <EditActions onSave={handleCreate} onCancel={() => setAdding(false)} loading={loading} />
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-5 py-3">
                                    <button onClick={() => setAdding(true)} className="flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
                                        <Plus className="h-4 w-4" /> Add Engagement
                                    </button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ContractsManager({ services, engagements, actions }: {
    services: Service[];
    engagements: Engagement[];
    actions: Actions;
}) {
    const [tab, setTab] = useState<'services' | 'engagements'>('services');

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                        <FileSignature className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">Contracts</h1>
                        <p className="text-sm text-slate-500">Manage Services and Engagements that appear in client forms</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
                {(['services', 'engagements'] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${tab === t ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                            {t === 'services' ? services.length : engagements.length}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mb-4 flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-xl p-4 text-xs text-amber-700">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
                <span>
                    <strong>Deletions require MFA verification.</strong> Deleting a service or engagement will unlink it from all associated clients, but will not delete the clients themselves.
                </span>
            </div>

            {tab === 'services'
                ? <ServicesTable services={services} actions={actions} />
                : <EngagementsTable engagements={engagements} services={services} actions={actions} />}
        </div>
    );
}
