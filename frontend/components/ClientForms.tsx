'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import toast from 'react-hot-toast';
import { Upload, Save, AlertTriangle } from 'lucide-react';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    >
      {pending ? 'Saving...' : label}
    </button>
  );
}

export function UpdateStatusForm({ client, action }: { client: any, action: (formData: FormData) => Promise<void> }) {
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
      className="space-y-6"
    >
      <input type="hidden" name="clientId" value={client.id} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">New Status</label>
          <select
            name="status"
            defaultValue={client.status}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="GREEN">GREEN - On Track</option>
            <option value="AMBER">AMBER - Needs Attention</option>
            <option value="RED">RED - Critical / At Risk</option>
          </select>
        </div>
        <div className="flex items-end pb-2">
          <div className="flex items-center h-5">
            <input
              id="watchlist"
              name="isOnWatchlist"
              type="checkbox"
              defaultChecked={client.isOnWatchlist}
              className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="watchlist" className="font-medium text-gray-700">Add to Watchlist</label>
            <p className="text-gray-500">Flag as "Verge of RED"</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Reason for Update <span className="text-red-500">*</span>
        </label>
        <textarea
          name="comments"
          required
          rows={4}
          className="mt-1 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm border border-gray-300 rounded-md"
          placeholder="Explain why the status changed. Be specific."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Evidence (Optional)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 transition-colors">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                <span>Upload a file</span>
                <input id="file-upload" name="evidence" type="file" className="sr-only" accept=".msg,.eml,.pdf,.png,.jpg" />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">MSG, EML, PDF up to 10MB</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-gray-100">
        <SubmitButton label="Update Status" />
      </div>
    </form>
  );
}

export function EscalationForm({ clientId, action }: { clientId: string, action: (formData: FormData) => Promise<void> }) {
  return (
    <form
      action={async (formData) => {
        try {
          await action(formData);
          toast.success('Escalation raised!');
          // Ideally clear the form, but difficult without ref. Simple enough for MVP.
        } catch (e) {
          toast.error('Failed to raise escalation.');
        }
      }}
      className="mt-4 pt-4 border-t border-red-100"
    >
      <input type="hidden" name="clientId" value={clientId} />
      <input
        name="title"
        placeholder="New Escalation Title..."
        className="block w-full text-sm border-gray-300 rounded-md mb-2"
        required
      />
      <select name="severity" className="block w-full text-sm border-gray-300 rounded-md mb-2">
        <option value="HIGH">High Severity</option>
        <option value="MEDIUM">Medium Severity</option>
      </select>
      <SubmitButton label="Raise Escalation" />
    </form>
  );
}

export function DeleteClientForm({ clientId, action }: { clientId: string, action: (formData: FormData) => Promise<void> }) {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="mt-8 pt-6 border-t border-red-100">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="text-sm font-bold text-red-900 mb-2 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-1" /> Final Confirmation
          </h4>
          <p className="text-xs text-red-700 mb-4">
            Are you absolutely sure? This will hide the client from all active views.
          </p>
          <div className="flex space-x-3">
            <form
              action={async (formData) => {
                try {
                  await action(formData);
                  toast.success('Client deleted successfully');
                } catch (e: any) {
                  if (e.message === 'NEXT_REDIRECT') throw e;
                  toast.error('Failed to delete client: ' + (e as Error).message);
                  setIsConfirming(false);
                }
              }}
            >
              <input type="hidden" name="clientId" value={clientId} />
              <SubmitButton label="Yes, Delete Client" />
            </form>
            <button
              type="button"
              onClick={() => setIsConfirming(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <button
        type="button"
        onClick={() => setIsConfirming(true)}
        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center"
      >
        Start Deletion Process
      </button>
    </div>
  );
}
