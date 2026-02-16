'use client';

import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { deleteRole } from '@/app/actions/role';

export function RoleDeleteButton({ id }: { id: string }) {
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this role?')) return;

        const formData = new FormData();
        formData.append('roleId', id);

        try {
            const result = await deleteRole(formData);
            if (result.success) {
                toast.success('Role deleted.');
            } else {
                toast.error(result.error || 'Failed to delete role.');
            }
        } catch (e) {
            toast.error('System error.');
        }
    };

    return (
        <button onClick={handleDelete} className="text-slate-400 hover:text-red-600 transition-colors">
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
