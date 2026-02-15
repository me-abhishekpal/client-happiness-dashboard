// app/admin/clients/page.tsx
import { PrismaClient } from '@prisma/client';
import { UserPlus, Pencil, X, Building } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import Link from 'next/link';
import { createClient, updateClient } from '@/app/actions/client';
import { AdminClientList } from '@/components/AdminClientList';

const prisma = new PrismaClient();

export default async function ClientManagement({
  searchParams
}: {
  searchParams?: { editId?: string }
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');
  if (currentUser.role !== 'ADMIN') redirect('/dashboard?error=access_denied');

  const clients = await prisma.client.findMany({ 
    orderBy: { createdAt: 'desc' },
    include: { owner: true, department: true }
  });
  
  const users = await prisma.user.findMany({ 
    where: { OR: [{ role: 'MANAGER' }, { role: 'EXECUTIVE' }] } 
  });
  
  const departments = await prisma.department.findMany();

  const editingClient = searchParams?.editId 
    ? clients.find(c => c.id === searchParams.editId)
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Building className="h-6 w-6 mr-2 text-blue-600" />
            Client Management
          </h1>
          <p className="text-gray-500">Onboard new clients.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create / Edit Client Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                {editingClient ? (
                  <>
                    <Pencil className="h-5 w-5 mr-2" /> Edit Client
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" /> Add New Client
                  </>
                )}
              </h3>
               {editingClient && (
                <Link href="/admin/clients" className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </Link>
              )}
            </div>

            <form action={editingClient ? updateClient : createClient} className="space-y-4">
              {editingClient && <input type="hidden" name="clientId" value={editingClient.id} />}
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Client Name</label>
                <input 
                  name="name" 
                  defaultValue={editingClient?.name || ''}
                  placeholder="Client Name" 
                  required 
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Service Type</label>
                <input 
                  name="serviceType" 
                  defaultValue={editingClient?.serviceType || ''}
                  placeholder="Service Type (e.g. MSS)" 
                  required 
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Department</label>
                <select 
                  name="departmentId" 
                  defaultValue={editingClient?.departmentId || ''}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Owner (Manager/Exec)</label>
                <select 
                  name="ownerId" 
                  defaultValue={editingClient?.ownerId || ''}
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">Select Owner...</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>

              <button 
                type="submit" 
                className={`w-full text-white py-2 px-4 rounded-md font-medium transition-colors ${
                  editingClient ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {editingClient ? 'Update Client' : 'Create Client'}
              </button>

              {editingClient && (
                <Link 
                  href="/admin/clients" 
                  className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
                >
                  Cancel
                </Link>
              )}
            </form>
          </div>

          {/* Client List */}
          <AdminClientList clients={clients} editingClient={editingClient} />
        </div>
      </main>
    </div>
  );
}
