'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const prisma = new PrismaClient();

export async function getRoles() {
    return await prisma.role.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { users: true } } }
    });
}

export async function getRole(id: string) {
    return await prisma.role.findUnique({
        where: { id }
    });
}

export async function createRole(formData: FormData) {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const permissions = formData.get('permissions') as string; // JSON string

    try {
        await prisma.role.create({
            data: {
                name,
                description,
                permissions
            }
        });
        revalidatePath('/admin/roles');
        return { success: true };
    } catch (error) {
        console.error('Create role failed:', error);
        return { success: false, error: 'Failed to create role. Name might be duplicate.' };
    }
}

export async function updateRole(formData: FormData) {
    const id = formData.get('roleId') as string;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const permissions = formData.get('permissions') as string;

    try {
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
    const id = formData.get('roleId') as string;

    try {
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
