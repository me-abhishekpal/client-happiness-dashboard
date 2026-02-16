'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getTitles() {
    return await prisma.title.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: { select: { users: true } },
            reportsTo: true
        }
    });
}

export async function getTitleById(id: string) {
    return await prisma.title.findUnique({
        where: { id },
        include: { reportsTo: true }
    });
}

export async function createTitle(formData: FormData) {
    const name = formData.get('name') as string;
    const reportsToId = formData.get('reportsToId') as string;

    try {
        await prisma.title.create({
            data: {
                name,
                reportsToId: reportsToId || null
            }
        });
        revalidatePath('/admin/titles');
        return { success: true };
    } catch (error) {
        console.error('Create title failed:', error);
        return { success: false, error: 'Failed to create title. Name might be duplicate.' };
    }
}

export async function updateTitle(formData: FormData) {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const reportsToId = formData.get('reportsToId') as string;

    try {
        await prisma.title.update({
            where: { id },
            data: {
                name,
                reportsToId: reportsToId || null
            }
        });
        revalidatePath('/admin/titles');
        return { success: true };
    } catch (error) {
        console.error('Update title failed:', error);
        return { success: false, error: 'Failed to update title.' };
    }
}

export async function deleteTitle(formData: FormData) {
    const id = formData.get('titleId') as string;

    try {
        const count = await prisma.user.count({ where: { titleId: id } });
        if (count > 0) {
            return { success: false, error: `Cannot delete title. It is assigned to ${count} users.` };
        }

        await prisma.title.delete({ where: { id } });
        revalidatePath('/admin/titles');
        return { success: true };
    } catch (error) {
        console.error('Delete title failed:', error);
        return { success: false, error: 'Failed to delete title.' };
    }
}
