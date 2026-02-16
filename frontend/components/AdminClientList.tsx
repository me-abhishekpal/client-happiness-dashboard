'use client';

import { useState } from 'react';
import { Pencil, Trash2, Filter, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteClient } from '@/app/actions/client';

const STATUSES = ['RED', 'AMBER', 'GREEN', 'UNKNOWN'];

const STATUS_COLORS = {
  RED: 'bg-red-100 text-red-800',
  AMBER: 'bg-yellow-100 text-yellow-800',
  GREEN: 'bg-green-100 text-green-800',
  CRITICAL: 'bg-red-100 text-red-800',
  AT_RISK: 'bg-yellow-100 text-yellow-800',
  HEALTHY: 'bg-green-100 text-green-800',
  UNKNOWN: 'bg-gray-100 text-gray-800',
};

const DISPLAY_STATUS = (status: string) => {
  switch (status) {
    case 'RED':
    case 'CRITICAL': return 'CRITICAL';
    case 'AMBER':
    case 'AT_RISK': return 'AT RISK';
    case 'GREEN':
    case 'HEALTHY': return 'HEALTHY';
    default: return status;
  }
};

export function AdminClientList({ clients, editingClient }: { clients: any[], editingClient: any }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusFilter = searchParams.get('status') || '';

  const handleStatusFilter = (status: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    router.push(`/admin/clients?${params.toString()}`);
  };

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Filter Bar */}
      <div className="p-4 bg-slate-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-slate-400" />
          <label className="text-sm font-medium text-slate-700">Filter by Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            className="rounded-lg border-slate-200 shadow-sm text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {statusFilter && (
            <span className="text-sm text-slate-500">
              Showing {clients.length} client{clients.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 z-20 bg-gray-50 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">CSM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">PM/TPM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Dept</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Owner</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.map((client) => (
              <tr key={client.id} className={editingClient?.id === client.id ? 'bg-blue-50' : ''}>
                <td className="sticky left-0 z-10 bg-inherit px-6 py-4 whitespace-nowrap border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  <Link
                    href={`/clients/${client.id}`}
                    className="text-sm font-bold text-blue-600 hover:text-blue-800 hover:underline transition-colors block max-w-[200px] truncate"
                    title={client.name}
                  >
                    {client.name}
                  </Link>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {client.status && (
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${STATUS_COLORS[client.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                      {DISPLAY_STATUS(client.status)}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.serviceType}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.csmName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.pmName || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.department?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.owner?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-3">
                    {confirmDeleteId === client.id ? (
                      <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
                        <span className="text-[10px] font-bold text-red-700 uppercase">Confirm?</span>
                        <form
                          action={async (formData) => {
                            try {
                              await deleteClient(formData);
                              toast.success('Client deleted');
                            } catch (error) {
                              toast.error('Failed to delete');
                            } finally {
                              setConfirmDeleteId(null);
                            }
                          }}
                        >
                          <input type="hidden" name="clientId" value={client.id} />
                          <button
                            type="submit"
                            className="bg-red-600 text-white p-1 rounded-md hover:bg-red-700"
                            title="Delete Permanently"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </form>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/admin/clients?editId=${client.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                          title="Edit Client"
                        >
                          <Pencil className="h-5 w-5" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(client.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                          title="Delete Client"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
