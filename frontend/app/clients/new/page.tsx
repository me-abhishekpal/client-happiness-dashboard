
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { createClient } from '@/app/actions/client';
import { Shield } from 'lucide-react';

const prisma = new PrismaClient();

export default async function NewClientPage() {
    const user = await getCurrentUser();
    if (!user) redirect('/login');

    const departments = await prisma.department.findMany();
    const owners = await prisma.user.findMany({
        where: {
            deletedAt: null,
            OR: [{ role: 'MANAGER' }, { role: 'EXECUTIVE' }, { role: 'ADMIN' }]
        }
    });

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-900">Add New Client</h1>
                </div>

                <form action={createClient} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Client Name</label>
                        <input
                            name="name"
                            required
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g. Acme Corp"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Service Type</label>
                        <select name="serviceType" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            <option value="MSS">MSS (Managed Security)</option>
                            <option value="ITO">ITO (IT Outsourcing)</option>
                            <option value="MEA">MEA (Modern Enterprise Apps)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department</label>
                        <select name="departmentId" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            {departments.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Owner (Manager/Exec)</label>
                        <select name="ownerId" defaultValue={user.id} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                            {owners.map(u => (
                                <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Create Client
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
