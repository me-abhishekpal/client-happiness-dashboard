'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import toast from 'react-hot-toast';
import { Upload, Save, AlertTriangle, Eye, Pencil } from 'lucide-react';
import { updateClientMetadata } from '@/app/actions/client';
import { SearchableSelect } from '@/components/ui/SearchableSelect';

function SubmitButton({ label, danger = false }: { label: string, danger?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-white w-full sm:w-auto ${danger ? 'bg-red-600 hover:bg-red-700 shadow-red-200' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'}`}
    >
      {pending ? 'Processing...' : label}
    </button>
  );
}

export function UpdateClientMetadataForm({
  client,
  services = [],
  engagements = [],
  users = []
}: {
  client: any,
  services?: any[],
  engagements?: any[],
  users?: any[]
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleAction(formData: FormData) {
    setPending(true);
    try {
      await updateClientMetadata(formData);
      toast.success('Client updated successfully');
      setIsEditing(false);
    } catch (e: any) {
      toast.error('Failed to update: ' + e.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form action={handleAction} className="space-y-6 p-6 border-b border-slate-100 hover:bg-slate-50/20 transition-colors">
      <input type="hidden" name="clientId" value={client.id} />

      {/* Client header row — Edit button sits inline at the right of the client name */}
      <div className="flex items-start justify-between pb-4 border-b border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            {client.name}
            {client.isOnWatchlist && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                <Eye className="h-3 w-3 mr-1" /> Watchlist
              </span>
            )}
          </h1>
          {client.owner && (
            <p className="text-sm text-slate-500 mt-1">Owner: {client.owner.name}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0 ml-4">
          <span className={`px-3 py-1 rounded-full text-sm font-bold ${client.status === 'RED' ? 'bg-red-100 text-red-800' :
            client.status === 'AMBER' ? 'bg-yellow-100 text-yellow-800' :
              'bg-green-100 text-green-800'
            }`}>
            {client.status}
          </span>
          {!isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-4 py-2 rounded-xl transition-all"
            >
              <Pencil className="h-4 w-4" /> Edit Metadata
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Service</label>
          <SearchableSelect
            name="serviceId"
            value={client.serviceId || ''}
            options={services.map(s => ({ value: s.id, label: s.name }))}
            disabled={!isEditing}
            placeholder="Select Service..."
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Revenue (ARR)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
            <input
              type="number"
              name="revenue"
              defaultValue={client.revenue || ''}
              disabled={!isEditing}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium disabled:opacity-70 disabled:bg-transparent"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Engagement</label>
            <SearchableSelect
              name="engagementId"
              value={client.engagementId || ''}
              options={engagements.map(e => ({ value: e.id, label: e.name }))}
              disabled={!isEditing}
              placeholder="Select Engagement..."
            />
          </div>
          <div className="sm:w-1/3">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Status</label>
            <SearchableSelect
              name="engagementStatus"
              value={client.engagementStatus || 'OPEN'}
              options={[
                { value: 'OPEN', label: 'OPEN' },
                { value: 'ONGOING', label: 'ONGOING' },
                { value: 'CLOSED', label: 'CLOSED' }
              ]}
              disabled={!isEditing}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Last Update</label>
          <div className="w-full bg-transparent border-0 rounded-xl py-3 text-slate-500 font-medium">
            {client.lastUpdated?.toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Current Engagement</label>
          <SearchableSelect
            name="engagementId"
            value={client.engagementId || ''}
            options={engagements.map(e => ({ value: e.id, label: e.name }))}
            disabled={!isEditing}
            placeholder="Select Engagement..."
            className="w-full flex items-center justify-between text-left bg-white border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Engagement Status</label>
          <SearchableSelect
            name="engagementStatus"
            value={client.engagementStatus || ''}
            options={[
              { value: 'OPEN', label: 'OPEN' },
              { value: 'ONGOING', label: 'ONGOING' },
              { value: 'CLOSED', label: 'CLOSED' }
            ]}
            disabled={!isEditing}
            placeholder="Select Status..."
            className="w-full flex items-center justify-between text-left bg-white border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Resource Link</label>
          <input
            type="url"
            name="resourceLink"
            defaultValue={client.resourceLink || ''}
            disabled={!isEditing}
            placeholder="https://..."
            className="w-full bg-white border-0 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Recent NPS</label>
          <input
            type="number"
            min="-100"
            max="100"
            name="nps"
            defaultValue={client.nps || ''}
            disabled={!isEditing}
            placeholder="e.g. 75"
            className="w-full bg-white border-0 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 shadow-sm"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Recent Kudos</label>
          <input
            type="number"
            min="0"
            name="kudos"
            defaultValue={client.kudos || ''}
            disabled={!isEditing}
            placeholder="e.g. 3"
            className="w-full bg-white border-0 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">CSM Name</label>
          <SearchableSelect
            name="csmId"
            value={client.csmId || ''}
            options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
            disabled={!isEditing}
            placeholder="Assign CSM..."
            className="w-full flex items-center justify-between text-left bg-white border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-transparent shadow-sm disabled:shadow-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">PM/TPM Name</label>
          <SearchableSelect
            name="pmId"
            value={client.pmId || ''}
            options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
            disabled={!isEditing}
            placeholder="Assign PM..."
            className="w-full flex items-center justify-between text-left bg-white border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-transparent shadow-sm disabled:shadow-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">vCISO Name</label>
          <SearchableSelect
            name="vcisoId"
            value={client.vcisoId || ''}
            options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
            disabled={!isEditing}
            placeholder="Assign vCISO..."
            className="w-full flex items-center justify-between text-left bg-white border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-transparent shadow-sm disabled:shadow-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Accountable</label>
          <SearchableSelect
            name="accountableId"
            value={client.accountableId || ''}
            options={users.map(u => ({ value: u.id, label: u.name || u.email }))}
            disabled={!isEditing}
            placeholder="Assign Owner..."
            className="w-full flex items-center justify-between text-left bg-white border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-transparent shadow-sm disabled:shadow-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Next Steps</label>
          <textarea
            name="nextSteps"
            defaultValue={client.nextSteps || ''}
            disabled={!isEditing}
            rows={2}
            placeholder="Action items..."
            className="w-full bg-white border-0 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 shadow-sm resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">CSM/PM Comments</label>
          <textarea
            name="csmPmComments"
            defaultValue={client.csmPmComments || ''}
            disabled={!isEditing}
            rows={2}
            placeholder="Operational notes..."
            className="w-full bg-white border-0 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 shadow-sm resize-none"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Executive Comments</label>
          <textarea
            name="executiveComments"
            defaultValue={client.executiveComments || ''}
            disabled={!isEditing}
            rows={2}
            placeholder="Leadership context..."
            className="w-full bg-white border-0 text-sm rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 shadow-sm resize-none"
          />
        </div>
      </div>

      {isEditing && (
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all focus:outline-none"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className={`inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-black rounded-xl shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-white bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200`}
          >
            {pending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  );
}


export function UpdateStatusForm({ client, action }: { client: any, action: (formData: FormData) => Promise<void> }) {
  const [status, setStatus] = useState(client.status);

  return (
    <form
      action={async (formData) => {
        try {
          await action(formData);
          toast.success('Status updated successfully!');
        } catch (e) {
          toast.error('Failed to update status: ' + (e as Error).message);
        }
      }}
      className="space-y-6 p-6"
    >
      <input type="hidden" name="clientId" value={client.id} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">New Status</label>
          <SearchableSelect
            name="status"
            value={status}
            onChange={setStatus}
            options={[
              { value: 'GREEN', label: 'GREEN – On Track' },
              { value: 'AMBER', label: 'AMBER – Needs Attention' },
              { value: 'RED', label: 'RED – Critical / At Risk' },
            ]}
          />
        </div>
        <div className="flex items-center sm:items-end pb-1 pb-3">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                id="watchlist"
                name="isOnWatchlist"
                type="checkbox"
                defaultChecked={client.isOnWatchlist}
                className="peer sr-only"
              />
              <div className="w-5 h-5 border-2 border-slate-300 rounded-md peer-checked:bg-emerald-500 peer-checked:border-emerald-500 transition-all flex items-center justify-center">
                <svg className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-700">Add to Watchlist</span>
              <span className="text-xs text-slate-400">Flag as "Verge of RED"</span>
            </div>
          </label>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block flex items-center">
          Reason for Update <span className="text-red-500 ml-1">*</span>
        </label>
        <textarea
          name="comments"
          required
          rows={4}
          className="w-full bg-slate-50 border-0 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
          placeholder="Explain why the status changed. Be specific."
        />
      </div>

      <div>
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 block">Evidence (Optional)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-xl hover:bg-slate-50/80 hover:border-emerald-400 transition-all group">
          <div className="space-y-2 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-emerald-100 transition-colors">
              <Upload className="h-6 w-6 text-slate-400 group-hover:text-emerald-600 transition-colors" />
            </div>
            <div className="flex text-sm text-slate-600 justify-center">
              <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                <span>Upload a file</span>
                <input id="file-upload" name="evidence" type="file" className="sr-only" accept=".msg,.eml,.pdf,.png,.jpg" />
              </label>
              <p className="pl-1 text-slate-500">or drag and drop</p>
            </div>
            <p className="text-xs font-medium text-slate-400">MSG, EML, PDF up to 10MB</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-100">
        <SubmitButton label="Update Status" />
      </div>
    </form>
  );
}

export function EscalationForm({ clientId, action }: { clientId: string, action: (formData: FormData) => Promise<void> }) {
  const [severity, setSeverity] = useState('HIGH');

  return (
    <form
      action={async (formData) => {
        try {
          await action(formData);
          toast.success('Escalation raised!');
        } catch (e) {
          toast.error('Failed to raise escalation.');
        }
      }}
      className="mt-6 pt-6 border-t border-red-100 flex flex-col gap-3"
    >
      <input type="hidden" name="clientId" value={clientId} />
      <div>
        <input
          name="title"
          placeholder="New Escalation Title..."
          className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all placeholder-slate-400 text-sm"
          required
        />
      </div>
      <div>
        <SearchableSelect
          name="severity"
          value={severity}
          onChange={setSeverity}
          options={[
            { value: 'HIGH', label: '🔴 High Severity' },
            { value: 'MEDIUM', label: '🟡 Medium Severity' },
          ]}
        />
      </div>
      <div className="pt-2">
        <SubmitButton label="Raise Escalation" danger={true} />
      </div>
    </form>
  );
}

export function DeleteClientForm({ clientId, action }: { clientId: string, action: (formData: FormData) => Promise<void> }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="mt-8 pt-6 border-t border-red-100">
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-sm">
          <h4 className="text-sm font-black text-red-900 mb-2 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" /> Administrative Action Required
          </h4>
          <p className="text-xs font-semibold text-red-800 mb-6 leading-relaxed">
            This action requires an MFA token and Administrative privileges. The client will be hidden from all active views.
          </p>
          <div className="flex flex-col space-y-4">
            <form
              action={async (formData) => {
                try {
                  await action(formData);
                  toast.success('Client deleted successfully');
                } catch (e: any) {
                  if (e.message === 'NEXT_REDIRECT') throw e;
                  toast.error((e as Error).message);
                  setIsConfirming(false);
                }
              }}
              className="flex flex-col gap-4"
            >
              <input type="hidden" name="clientId" value={clientId} />

              <div>
                <label className="text-xs font-bold text-red-900 uppercase tracking-wider mb-2 block">MFA Verification Code</label>
                <input
                  type="text"
                  name="mfaCode"
                  placeholder="000000"
                  required
                  maxLength={6}
                  pattern="\d{6}"
                  className="w-full bg-white border-2 border-red-200 rounded-xl px-4 py-3 text-slate-900 text-center tracking-[0.5em] font-mono text-lg focus:ring-4 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all placeholder-slate-300"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <div className="flex-1 text-center">
                  <SubmitButton label="Verify & Delete" danger={true} />
                </div>
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 px-6 py-3 text-sm font-bold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 shadow-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-red-50">
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="w-full text-center py-4 rounded-xl border-2 border-red-100 border-dashed text-red-600 hover:text-red-800 hover:bg-red-50 text-sm font-black flex items-center justify-center transition-all group"
      >
        <span className="group-hover:-translate-x-1 transition-transform">Start Deletion Process</span>
      </button>
    </div>
  );
}
