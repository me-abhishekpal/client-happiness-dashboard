'use client';

import { useState } from 'react';
import { Trash2, Check, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { deleteTitle } from '@/app/actions/title';

export function TitleDeleteButton({ id }: { id: string }) {
    const [isConfirming, setIsConfirming] = useState(false);

    const handleDelete = async () => {
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
        } finally {
            setIsConfirming(false);
        }
    };

    if (isConfirming) {
        return (
            <div className="flex items-center space-x-1 animate-in fade-in zoom-in duration-200">
                <button
                    onClick={handleDelete}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    title="Confirm Delete"
                >
                    <Check className="h-3 w-3" />
                </button>
                <button
                    onClick={() => setIsConfirming(false)}
                    className="p-1 bg-slate-100 text-slate-400 rounded hover:text-slate-600 transition-colors"
                    title="Cancel"
                >
                    <X className="h-3 w-3" />
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => setIsConfirming(true)}
            className="text-slate-400 hover:text-red-600 transition-colors p-1"
            title="Delete Title"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}
