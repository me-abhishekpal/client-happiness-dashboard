// app/admin/users/page.tsx
import { PrismaClient } from '@prisma/client';
import { UserPlus, Pencil, X, Shield } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminUserList } from '@/components/AdminUserList';
import { UserForm } from '@/components/UserForm'; // Add this
import { createUser, updateUser } from '@/app/actions/user';

const prisma = new PrismaClient();

import { requirePermission } from '@/lib/rbac';

export default async function UserManagement({
  searchParams
}: {
  searchParams?: { editId?: string }
}) {
  await requirePermission('admin_users');
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    include: { roleRel: true, titleRel: true }
  });

  const roles = await prisma.role.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  const titles = await prisma.title.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  const managers = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { name: 'asc' },
    select: { id: true, name: true }
  });

  // Await searchParams for Next.js 15.1
  const params = await searchParams;
  const editingUser = params?.editId
    ? users.find(u => u.id === params.editId)
    : null;

  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <Shield className="h-6 w-6 mr-2 text-blue-600" />
          User Management
        </h1>
        <p className="text-gray-500">Manage access and roles.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create / Edit User Form (Client Component) */}
        <UserForm
          editingUser={editingUser}
          roles={roles}
          titles={titles}
          managers={managers}
          updateAction={updateUser}
          createAction={createUser}
        />

        {/* User List Component */}
        <AdminUserList users={users} editingUser={editingUser} />
      </div>
    </div>
  );
}
