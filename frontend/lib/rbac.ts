import { getCurrentUser } from './session';
import { redirect } from 'next/navigation';
import { checkPermission } from './rbac-logic';

export async function hasPermission(permission: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    // 1. Super admin bypass (Platform ADMIN role)
    if (user.role === 'ADMIN' || user.roleRel?.name === 'ADMIN') return true;

    // 2. Legacy Fallback if roleRel is missing
    if (!user.roleRel) {
        const legacyPermissions: Record<string, string[]> = {
            'EXECUTIVE': ['dashboard:view', 'clients:view', 'performance:view', 'strategy:view', 'org_chart:view'],
            'MANAGER': ['dashboard:view', 'clients:view', 'clients:edit', 'org_chart:view'],
            'VIEWER': ['dashboard:view']
        };
        const perms = legacyPermissions[user.role] || [];
        return perms.includes(permission);
    }

    // 3. Use Shared Logic
    return checkPermission(permission, user.roleRel.permissions);
}

export async function requirePermission(permission: string) {
    const allowed = await hasPermission(permission);
    if (!allowed) {
        redirect('/dashboard?error=access_denied');
    }
}
