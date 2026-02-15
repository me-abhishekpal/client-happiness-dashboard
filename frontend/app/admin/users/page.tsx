// app/admin/users/page.tsx
import { PrismaClient } from '@prisma/client';
import { UserPlus, Pencil, X, Shield } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { Sidebar } from '@/components/Sidebar';
import { AdminUserList } from '@/components/AdminUserList';
import Link from 'next/link';
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

  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  
  const editingUser = searchParams?.editId 
    ? users.find(u => u.id === searchParams.editId) 
    : null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8 ml-64">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            User Management
          </h1>
          <p className="text-gray-500">Manage access and roles.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create / Edit User Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit sticky top-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center">
                {editingUser ? (
                  <>
                    <Pencil className="h-5 w-5 mr-2" /> Edit User
                  </>
                ) : (
                  <>
                    <UserPlus className="h-5 w-5 mr-2" /> Add New User
                  </>
                )}
              </h3>
              {editingUser && (
                <Link href="/admin/users" className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </Link>
              )}
            </div>

            <form action={editingUser ? updateUser : createUser} className="space-y-4">
              {editingUser && <input type="hidden" name="userId" value={editingUser.id} />}
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  name="name" 
                  defaultValue={editingUser?.name || ''} 
                  placeholder="Full Name" 
                  required 
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email Address</label>
                <input 
                  name="email" 
                  type="email" 
                  defaultValue={editingUser?.email || ''} 
                  placeholder="Email Address" 
                  required 
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Job Title</label>
                <select 
                  name="title" 
                  defaultValue={editingUser?.title || ''} 
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="">Select Title...</option>
                  <option value="Accountable Lead">Accountable Lead</option>
                  <option value="CS Manager">CS Manager</option>
                  <option value="System Architect">System Architect</option>
                  <option value="Executive">Executive</option>
                  <option value="Network Administrator">Network Administrator</option>
                  <option value="System Administrator">System Administrator</option>
                  <option value="Manager">Manager</option>
                  <option value="Director">Director</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Senior Tester">Senior Tester</option>
                  <option value="Estimator">Estimator</option>
                  <option value="Intern">Intern</option>
                  <option value="Specialist">Specialist</option>
                  <option value="IT Support Specialist">IT Support Specialist</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Security Officer">Security Officer</option>
                  <option value="Network Implementation Engineer">Network Implementation Engineer</option>
                  <option value="Network Security Engineer">Network Security Engineer</option>
                  <option value="Client Director">Client Director</option>
                  <option value="Consultant">Consultant</option>
                  <option value="IT Support Technician">IT Support Technician</option>
                  <option value="Help Desk Technician">Help Desk Technician</option>
                  <option value="Senior Business Analyst">Senior Business Analyst</option>
                  <option value="IT Technician">IT Technician</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Role</label>
                <select 
                  name="role" 
                  defaultValue={editingUser?.role || 'VIEWER'} 
                  className="block w-full border-gray-300 rounded-md shadow-sm sm:text-sm"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="MANAGER">Manager</option>
                  <option value="EXECUTIVE">Executive</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <button 
                type="submit" 
                className={`w-full text-white py-2 px-4 rounded-md font-medium transition-colors ${
                  editingUser ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              
              {editingUser && (
                <Link 
                  href="/admin/users" 
                  className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-2"
                >
                  Cancel
                </Link>
              )}
            </form>
          </div>

          {/* User List Component */}
          <AdminUserList users={users} editingUser={editingUser} />
        </div>
      </main>
    </div>
  );
}
