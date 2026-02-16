'use client';

import { Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { deleteTitle } from '@/app/actions/title';

export function TitleDeleteButton({ id }: { id: string }) {
    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this title?')) return;

        const formData = new FormData();
        formData.append('titleId', id);

        try {
            const result = await deleteTitle(formData);
            if (result.success) {
                toast.success('Title deleted.');
            } else {
                toast.error(result.error || 'Failed to delete title.');
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
