// components/RecycleBinActions.tsx
'use client';

import React from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ActionProps {
    id: string;
    type: 'client' | 'user';
    action: (formData: FormData) => Promise<{ success: boolean; error?: string } | any>;
    label: string;
    iconType: 'restore' | 'wipe';
    className: string;
    confirmMessage?: string;
    successMessage: string;
}

export function RecycleBinButton({ id, type, action, label, iconType, className, confirmMessage, successMessage }: ActionProps) {
    const Icon = iconType === 'restore' ? RotateCcw : Trash2;

    const handleAction = async (formData: FormData) => {
        if (confirmMessage && !confirm(confirmMessage)) return;

        try {
            const result = await action(formData);

            // Check if it's a result object or a legacy void return
            if (result && typeof result === 'object' && 'success' in result) {
                if (result.success) {
                    toast.success(successMessage);
                } else {
                    toast.error(result.error || 'Operation failed');
                }
            } else {
                toast.success(successMessage);
            }
        } catch (error) {
            console.error('Action failed:', error);
            toast.error('Operation failed. Please try again.');
        }
    };

    return (
        <form action={handleAction} className="inline-block">
            <input type="hidden" name={type === 'client' ? 'clientId' : 'userId'} value={id} />
            <button type="submit" className={className}>
                <Icon className="h-4 w-4 mr-1" /> {label}
            </button>
        </form>
    );
}
