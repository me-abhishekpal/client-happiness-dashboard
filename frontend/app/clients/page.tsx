// app/clients/page.tsx
import { PrismaClient } from '@prisma/client';
import { Shield, User, Search, Eye } from 'lucide-react';
import Link from 'next/link';
import { ClientListFilter } from '@/components/ClientListFilter';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export default async function ClientList({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams;

  const clients = await prisma.client.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {})
    },
    include: {
      owner: true,
      accountable: true,
      department: true
    },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Clients</h1>
          <p className="text-gray-500">Manage portfolio health.</p>
        </div>
        <Link href="/admin/clients" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          + Manage Clients
        </Link>
      </header>

      {/* Client Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <ClientListFilter currentStatus={status || ''} clientCount={clients.length} />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Last Update</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:text-blue-800">
                    <Link href={`/clients/${encodeURIComponent(client.id)}`} className="flex items-center">
                      {client.name}
                      {client.isOnWatchlist && <Eye className="h-3 w-3 ml-2 text-purple-500" />}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${client.status === 'RED' ? 'bg-red-100 text-red-800' :
                        client.status === 'AMBER' ? 'bg-yellow-100 text-yellow-800' :
                          client.status === 'GREEN' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.owner?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.department?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{client.lastUpdated.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
