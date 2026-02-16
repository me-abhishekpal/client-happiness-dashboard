// app/admin/recycle-bin/page.tsx
import { PrismaClient } from '@prisma/client';
import { Trash2, Building, User, ShieldAlert } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { restoreClient, hardDeleteClient } from '@/app/actions/client';
import { restoreUser, hardDeleteUser } from '@/app/actions/user';
import { RecycleBinButton } from '@/components/RecycleBinActions';

const prisma = new PrismaClient();

export default async function RecycleBin() {
    const currentUser = await getCurrentUser();
    if (!currentUser) redirect('/login');
    if (currentUser.role !== 'ADMIN') redirect('/dashboard?error=access_denied');

    const deletedClients = await prisma.client.findMany({
        where: { deletedAt: { not: null } },
        include: { owner: true, department: true },
        orderBy: { deletedAt: 'desc' }
    });

    const deletedUsers = await prisma.user.findMany({
        where: { deletedAt: { not: null } },
        orderBy: { deletedAt: 'desc' }
    });

    const isEmpty = deletedClients.length === 0 && deletedUsers.length === 0;

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Trash2 className="h-6 w-6 mr-2 text-red-600" />
                    Recycle Bin
                </h1>
                <p className="text-gray-500">Restore accidentally deleted items or wipe them permanently.</p>
            </header>

            {isEmpty ? (
                <div className="bg-white rounded-xl border border-dashed border-gray-300 p-12 text-center">
                    <Trash2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Your bin is empty</h3>
                    <p className="text-gray-500">No deleted items found at the moment.</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {/* Deleted Clients Section */}
                    {deletedClients.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                                <Building className="h-5 w-5 mr-2" /> Deleted Clients ({deletedClients.length})
                            </h2>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 uppercase tracking-wider text-[10px] font-bold text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 text-left">Client</th>
                                            <th className="px-6 py-4 text-left">Department</th>
                                            <th className="px-6 py-4 text-left">Deleted At</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {deletedClients.map((client) => (
                                            <tr key={client.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-slate-800">{client.name}</div>
                                                    <div className="text-[11px] text-slate-400 uppercase font-medium">{client.serviceType}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                                                    {client.department?.name || 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                                                    {client.deletedAt?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-4 text-xs font-bold uppercase transition-all duration-300">
                                                    <RecycleBinButton
                                                        id={client.id}
                                                        type="client"
                                                        action={restoreClient}
                                                        label="Restore"
                                                        iconType="restore"
                                                        className="text-white bg-emerald-500/90 hover:bg-emerald-600 px-4 py-2 rounded-xl shadow-lg shadow-emerald-100/50 inline-flex items-center gap-1.5 transition-all"
                                                        successMessage="Client restored successfully"
                                                    />
                                                    <RecycleBinButton
                                                        id={client.id}
                                                        type="client"
                                                        action={hardDeleteClient}
                                                        label="Wipe"
                                                        iconType="wipe"
                                                        className="text-white bg-red-500/90 hover:bg-red-600 px-4 py-2 rounded-xl shadow-lg shadow-red-100/50 inline-flex items-center gap-1.5 transition-all"
                                                        confirmMessage="PERMANENTLY DELETE this client? All history will be lost."
                                                        successMessage="Client purged permanently"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Deleted Users Section */}
                    {deletedUsers.length > 0 && (
                        <section>
                            <h2 className="text-lg font-semibold mb-4 flex items-center text-gray-700">
                                <User className="h-5 w-5 mr-2" /> Deleted Users ({deletedUsers.length})
                            </h2>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-sm">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 uppercase tracking-wider text-[10px] font-bold text-slate-400">
                                        <tr>
                                            <th className="px-6 py-4 text-left">User</th>
                                            <th className="px-6 py-4 text-left">Role</th>
                                            <th className="px-6 py-4 text-left">Deleted At</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {deletedUsers.map((user) => (
                                            <tr key={user.id} className="hover:bg-slate-50/50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="font-bold text-slate-800">{user.name}</div>
                                                    <div className="text-[11px] text-slate-400 uppercase font-medium">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest">
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                                                    {user.deletedAt?.toLocaleString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right space-x-4 text-xs font-bold uppercase transition-all duration-300">
                                                    <RecycleBinButton
                                                        id={user.id}
                                                        type="user"
                                                        action={restoreUser}
                                                        label="Restore"
                                                        iconType="restore"
                                                        className="text-white bg-emerald-500/90 hover:bg-emerald-600 px-4 py-2 rounded-xl shadow-lg shadow-emerald-100/50 inline-flex items-center gap-1.5 transition-all"
                                                        successMessage="User restored successfully"
                                                    />
                                                    <RecycleBinButton
                                                        id={user.id}
                                                        type="user"
                                                        action={hardDeleteUser}
                                                        label="Wipe"
                                                        iconType="wipe"
                                                        className="text-white bg-red-500/90 hover:bg-red-600 px-4 py-2 rounded-xl shadow-lg shadow-red-100/50 inline-flex items-center gap-1.5 transition-all"
                                                        confirmMessage="PERMANENTLY DELETE this user?"
                                                        successMessage="User purged permanently"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    <div className="bg-amber-50 border border-amber-200 p-6 rounded-3xl flex items-start shadow-sm">
                        <ShieldAlert className="h-6 w-6 text-amber-600 mr-4 mt-1" />
                        <div>
                            <p className="text-sm font-bold text-amber-800 tracking-tight leading-none mb-2">Data Retention Policy</p>
                            <p className="text-xs text-amber-700/80 font-medium leading-relaxed">Items in the recycle bin are kept until manually purged. Wiping an item is permanent and cascades to all child records (Audit Logs, File References, and Service History).</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
