'use client';

import { useState } from 'react';
import { Pencil, Trash2, AlertTriangle, ShieldOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { deleteUser, resetUserMFA } from '@/app/actions/user';
import { TablePagination } from './TablePagination';

export function AdminUserList({ users, editingUser }: { users: any[], editingUser: any }) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmResetMFAId, setConfirmResetMFAId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Slice users array
  const totalItems = users.length;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = users.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">MFA</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className={editingUser?.id === user.id ? 'bg-blue-50' : ''}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${(user.role === 'ADMIN' || user.role === 'SUPERADMIN') ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                    {user.role}
                  </span>
                  <div className="text-xs text-gray-500 mt-1">{user.titleRel?.name || user.title || '-'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.mfaEnabled ? (
                    <span className="text-green-600 font-bold">Enabled</span>
                  ) : (
                    <span className="text-gray-400">Disabled</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end items-center space-x-3">
                    {confirmDeleteId === user.id ? (
                      <div className="flex items-center space-x-2 bg-red-50 p-2 rounded-lg border border-red-100 animate-in fade-in zoom-in duration-200">
                        <span className="text-[10px] font-bold text-red-700 uppercase">Confirm?</span>
                        <form
                          action={async (formData) => {
                            try {
                              await deleteUser(formData);
                              toast.success('User deleted');
                            } catch (error) {
                              toast.error('Failed to delete');
                            } finally {
                              setConfirmDeleteId(null);
                            }
                          }}
                        >
                          <input type="hidden" name="userId" value={user.id} />
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
                    ) : confirmResetMFAId === user.id ? (
                      <div className="flex items-center space-x-2 bg-amber-50 p-2 rounded-lg border border-amber-200 animate-in fade-in zoom-in duration-200">
                        <span className="text-[9px] font-bold text-amber-800 uppercase whitespace-nowrap">Reset MFA?</span>
                        <form
                          action={async (formData) => {
                            try {
                              const result = await resetUserMFA(formData);
                              if (result.success) {
                                toast.success('MFA reset - user will reconfigure on next login');
                              } else {
                                toast.error(result.error || 'Failed to reset MFA');
                              }
                            } catch (error) {
                              toast.error('System error while resetting MFA');
                            } finally {
                              setConfirmResetMFAId(null);
                            }
                          }}
                        >
                          <input type="hidden" name="userId" value={user.id} />
                          <button
                            type="submit"
                            className="bg-amber-600 text-white p-1 rounded-md hover:bg-amber-700"
                            title="Confirm Reset"
                          >
                            <ShieldOff className="h-3.5 w-3.5" />
                          </button>
                        </form>
                        <button
                          onClick={() => setConfirmResetMFAId(null)}
                          className="text-slate-400 hover:text-slate-600 p-1"
                        >
                          <AlertTriangle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Link
                          href={`/admin/users?editId=${user.id}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors p-1"
                          title="Edit User"
                        >
                          <Pencil className="h-5 w-5" />
                        </Link>

                        {user.mfaEnabled && (
                          <button
                            type="button"
                            onClick={() => setConfirmResetMFAId(user.id)}
                            className="text-amber-600 hover:text-amber-900 transition-colors p-1"
                            title="Reset MFA - User will reconfigure on next login"
                          >
                            <ShieldOff className="h-5 w-5" />
                          </button>
                        )}

                        <button
                          type="button"
                          disabled={user.email === 'abhee@example.com'}
                          onClick={() => setConfirmDeleteId(user.id)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1 disabled:opacity-30"
                          title="Delete User"
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
      <TablePagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
