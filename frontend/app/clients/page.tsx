import { prisma } from '@/lib/prisma-tenant';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { ClientListFilter } from '@/components/ClientListFilter';
import { ClientTable } from '@/components/ClientTable';
export const dynamic = 'force-dynamic';

import { requirePermission } from '@/lib/rbac';

export default async function ClientList({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>
}) {
  await requirePermission('clients:view');
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

        <ClientTable clients={clients} />
      </div>
    </div>
  );
}
