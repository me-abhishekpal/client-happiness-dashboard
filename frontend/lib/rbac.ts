import { getCurrentUser } from './session';
import { redirect } from 'next/navigation';
import { checkPermission } from './rbac-logic';

export async function hasPermission(permission: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    // 1. Super admin bypass (Platform ADMIN role)
    if (user.role === 'SUPERADMIN' || user.role === 'ADMIN' || user.roleRel?.name === 'ADMIN') return true;

    // 2. Strict Role Rel Requirement
    if (!user.roleRel) {
        return false;
    }

    // 3. Use Shared Logic
    return checkPermission(permission, user.roleRel.permissions);
}

export async function requirePermission(permission: string) {
    const allowed = await hasPermission(permission);
    if (!allowed) {
        redirect('/login?error=access_denied');
    }
}
