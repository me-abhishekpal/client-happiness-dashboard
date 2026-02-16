// components/AdminClientList.tsx
'use client';

import { Pencil, Trash2, Filter } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { deleteClient } from '@/app/actions/client';

const STATUSES = ['RED', 'AMBER', 'GREEN', 'UNKNOWN'];

const STATUS_COLORS = {
  RED: 'bg-red-100 text-red-800',
  AMBER: 'bg-yellow-100 text-yellow-800',
  GREEN: 'bg-green-100 text-green-800',
  UNKNOWN: 'bg-gray-100 text-gray-800',
};

export function AdminClientList({ clients, editingClient }: { clients: any[], editingClient: any }) {
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Client</th>
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
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{client.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {client.status && (
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${STATUS_COLORS[client.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}`}>
                      {client.status}
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end space-x-3">
                  <Link
                    href={`/admin/clients?editId=${client.id}`}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Pencil className="h-5 w-5" />
                  </Link>

                  <form action={deleteClient}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <button
                      type="submit"
                      className="text-red-600 hover:text-red-900"
                      onClick={(e) => {
                        if (!confirm('Delete this client?')) e.preventDefault();
                      }}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
