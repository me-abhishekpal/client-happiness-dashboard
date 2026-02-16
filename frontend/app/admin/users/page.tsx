// app/admin/users/page.tsx
import { PrismaClient } from '@prisma/client';
import { UserPlus, Pencil, X, Shield } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { AdminUserList } from '@/components/AdminUserList';
import { UserForm } from '@/components/UserForm'; // Add this
import { createUser, updateUser } from '@/app/actions/user';

const prisma = new PrismaClient();

export default async function UserManagement({
  searchParams
}: {
  searchParams?: { editId?: string }
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');
  if (currentUser.role !== 'ADMIN') redirect('/dashboard?error=access_denied');

  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' }
  });

  const editingUser = searchParams?.editId
    ? users.find(u => u.id === searchParams.editId)
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
          updateAction={updateUser}
          createAction={createUser}
        />

        {/* User List Component */}
        <AdminUserList users={users} editingUser={editingUser} />
      </div>
    </div>
  );
}
