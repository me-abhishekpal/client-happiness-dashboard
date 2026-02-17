/**
 * Pure permission checking logic.
 * Safely runs on both Client and Server.
 */

export function checkPermission(permission: string, rolePermissions: string[] | string | null | undefined): boolean {
    if (!rolePermissions) return false;

    let permissions: string[] = [];

    if (typeof rolePermissions === 'string') {
        try {
            permissions = JSON.parse(rolePermissions);
        } catch (e) {
            console.error('Failed to parse permissions:', e);
            return false;
        }
    } else if (Array.isArray(rolePermissions)) {
        permissions = rolePermissions;
    }

    if (!Array.isArray(permissions)) return false;

    // Platform ADMIN bypass or simple wildcard
    if (permissions.includes('*') || permissions.includes("['*']")) return true;

    // Check for exact match
    if (permissions.includes(permission)) return true;

    // Check for page-level wildcard (e.g., 'clients:*' matches 'clients:edit')
    const [page] = permission.split(':');
    if (page && permissions.includes(`${page}:*`)) return true;

    return false;
}
