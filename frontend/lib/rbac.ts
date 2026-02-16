import { getCurrentUser } from './session';
import { redirect } from 'next/navigation';

export async function hasPermission(permission: string): Promise<boolean> {
    const user = await getCurrentUser();
    if (!user) return false;

    // 1. Super admin bypass (Legacy string role + Relational role)
    if (user.role === 'ADMIN' || user.roleRel?.name === 'ADMIN') return true;

    // 2. Legacy Fallback if roleRel is missing
    if (!user.roleRel) {
        // Map legacy roles to basic permissions
        const legacyPermissions: Record<string, string[]> = {
            'EXECUTIVE': ['dashboard', 'clients_read', 'reports'],
            'MANAGER': ['dashboard', 'clients_read', 'clients_write'],
            'VIEWER': ['dashboard']
        };
        const perms = legacyPermissions[user.role] || [];
        return perms.includes(permission);
    }

    // 3. Dynamic Permissions from DB
    try {
        const permissions = JSON.parse(user.roleRel.permissions);
        return Array.isArray(permissions) && (permissions.includes(permission) || permissions.includes('*'));
    } catch (e) {
        console.error('Error parsing permissions:', e);
        return false;
    }
}

export async function requirePermission(permission: string) {
    const allowed = await hasPermission(permission);
    if (!allowed) {
        redirect('/dashboard?error=access_denied');
    }
}
