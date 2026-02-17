'use server';
// FIX_MARKER_V1

import { prisma } from '@/lib/prisma-tenant';
import { getTenantId } from '@/lib/tenant-context';
import { revalidatePath } from 'next/cache';


export async function getRoles() {
    return await prisma.role.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { users: true } } }
    });
}

export async function getRole(id: string) {
    const tenantId = await getTenantId();
    if (!tenantId) return null;
    return await prisma.role.findFirst({
        where: { id }
    });
}

import { requirePermission } from '@/lib/rbac';

export async function createRole(formData: FormData) {
    await requirePermission('roles:edit');
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const permissions = formData.get('permissions') as string; // JSON string

    try {
        const tenantId = await getTenantId();
        if (!tenantId) throw new Error("No tenant context");

        await prisma.role.create({
            data: {
                name,
                description,
                permissions,
                tenantId: tenantId!
            } as any
        });
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error) {
        console.error('Create role failed:', error);
        return { success: false, error: 'Failed to create role. Name might be duplicate.' };
    }
}

export async function updateRole(formData: FormData) {
    await requirePermission('roles:edit');
    const id = formData.get('roleId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const permissions = formData.get('permissions') as string;

    try {
        const tenantId = await getTenantId();
        if (!tenantId) throw new Error("No tenant context");

        await prisma.role.update({
            where: { id },
            data: {
                name,
                description,
                permissions
            }
        });
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error) {
        console.error('Update role failed:', error);
        return { success: false, error: 'Failed to update role.' };
    }
}

export async function deleteRole(formData: FormData) {
    await requirePermission('roles:edit');
    const id = formData.get('roleId') as string;

    try {
        const tenantId = await getTenantId();
        if (!tenantId) throw new Error("No tenant context");

        // Check if role is in use
        const count = await prisma.user.count({ where: { roleId: id } });
        if (count > 0) {
            return { success: false, error: `Cannot delete role. It is assigned to ${count} users.` };
        }

        await prisma.role.delete({ where: { id } });
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error) {
        console.error('Delete role failed:', error);
        return { success: false, error: 'Failed to delete role.' };
    }
}
