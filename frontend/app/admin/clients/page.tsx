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
  console.log("Fetched Clients:", JSON.stringify(clients, null, 2));

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    include: { titleRel: true }
  });

  // Filter users by their titleRel (the foreign key to Title table)
  // Users created through the form will have titleRel set, not the legacy 'title' string
  const potentialCSMs = users.filter(u => {
    const titleName = u.titleRel?.name || u.title; // Fallback to legacy title if titleRel not set
    return titleName === 'Customer Success Manager';
  });
  console.log("All Users:", users.map(u => ({ id: u.id, name: u.name, title: u.title, titleRelName: u.titleRel?.name })));
  console.log("Potential CSMs:", potentialCSMs.map(u => ({ id: u.id, name: u.name, title: u.title })));

  const potentialPMs = users.filter(u => {
    const titleName = u.titleRel?.name || u.title;
    return ['Project Manager', 'Technical Project Manager'].includes(titleName || '');
  });
  console.log("Potential PMs:", potentialPMs.map(u => ({ id: u.id, name: u.name, title: u.title })));

  const potentialAMs = users.filter(u => {
    const titleName = u.titleRel?.name || u.title;
    return titleName === 'Account Manager';
  });
  console.log("Potential AMs:", potentialAMs.map(u => ({ id: u.id, name: u.name, title: u.title })));

  const departments = await prisma.department.findMany({
    where: {
      name: { notIn: ['PMO', 'CS', 'AM'] }
    }
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
          users={users} // All users for Owner/Accountable
          departments={departments}
          potentialCSMs={potentialCSMs}
          potentialPMs={potentialPMs}
          potentialAMs={potentialAMs}
          updateAction={updateClient}
          createAction={createClient}
        />

        {/* Client List */}
        <AdminClientList clients={clients} editingClient={editingClient} />
      </div>
    </div>
  );
}
