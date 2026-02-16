import { PrismaClient } from '@prisma/client';
import { Network } from 'lucide-react';
import { getCurrentUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { requirePermission } from '@/lib/rbac';
import { OrgChartCanvas } from '@/components/OrgChart/OrgChartCanvas';

const prisma = new PrismaClient();

// Types for Tree Construction
interface UserNode {
    id: string;
    name: string | null;
    email: string;
    managerId: string | null;
    titleRel?: { name: string } | null;
    roleRel?: { name: string } | null;
    directReports?: UserNode[];
}

// Helper to build tree from flat list
function buildHierarchy(users: any[]) {
    const userMap = new Map<string, UserNode>();
    const roots: UserNode[] = [];

    // 1. Initialize nodes
    users.forEach(user => {
        userMap.set(user.id, { ...user, directReports: [] });
    });

    // 2. Build relationships
    users.forEach(user => {
        const node = userMap.get(user.id)!;
        if (user.managerId && userMap.has(user.managerId)) {
            const manager = userMap.get(user.managerId)!;
            manager.directReports?.push(node);
        } else {
            roots.push(node);
        }
    });

    return roots;
}

export default async function OrgChartPage() {
    await requirePermission('admin_users'); // Re-using admin_users permission for now
    const currentUser = await getCurrentUser();
    if (!currentUser) redirect('/login');

    const users = await prisma.user.findMany({
        where: { deletedAt: null },
        include: {
            titleRel: true,
            roleRel: true
        },
        orderBy: { name: 'asc' }
    });

    const hierarchy = buildHierarchy(users);

    return (
        <div className="p-8 min-h-screen bg-slate-50">
            <header className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                    <Network className="h-6 w-6 mr-2 text-blue-600" />
                    Organization Chart
                </h1>
                <p className="text-gray-500">Visual hierarchy of the organization. Use mouse wheel to zoom, drag to pan.</p>
            </header>

            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
                {hierarchy.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400">
                        <p>No users found in the system.</p>
                    </div>
                ) : (
                    <OrgChartCanvas hierarchy={hierarchy} />
                )}
            </div>
        </div>
    );
}
