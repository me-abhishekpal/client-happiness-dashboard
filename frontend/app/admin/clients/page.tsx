import { prisma } from '@/lib/prisma-tenant';
import { Building } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { createClient, updateClient } from '@/app/actions/client';
import { AdminClientList } from '@/components/AdminClientList';
import { ClientForm } from '@/components/ClientForm';
import { requirePermission } from '@/lib/rbac';

export default async function ClientManagement({
  searchParams
}: {
  searchParams: Promise<{ editId?: string; status?: string }>
}) {
  await requirePermission('clients:edit');
  const { editId, status } = await searchParams;
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const clients = await prisma.client.findMany({
    where: {
      deletedAt: null,
      ...(status ? { status } : {})
    },
    orderBy: { createdAt: 'desc' },
    include: { owner: true, department: true }
  });

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { titleRel: true }
  });

  const departments = await prisma.department.findMany({
    where: {
      name: { notIn: ['PMO', 'CS', 'AM'] }
    }
  });

  const services = await prisma.service.findMany({
    orderBy: { name: 'asc' }
  });

  const engagements = await prisma.engagement.findMany({
    orderBy: { name: 'asc' }
  });

  const editingClient = editId
    ? clients.find(c => c.id === editId)
    : null;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Building className="h-6 w-6 mr-2 text-blue-600" />
          Client Management
        </h1>
        <p className="text-gray-500">Onboard new clients.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create / Edit Client Form */}
        <ClientForm
          editingClient={editingClient}
          users={users}
          departments={departments}
          services={services}
          engagements={engagements}
          updateAction={updateClient}
          createAction={createClient}
        />

        {/* Client List */}
        <AdminClientList clients={clients} editingClient={editingClient} />
      </div>
    </div>
  );
}
