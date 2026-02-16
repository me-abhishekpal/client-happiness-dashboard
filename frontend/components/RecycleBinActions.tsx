// components/RecycleBinActions.tsx
'use client';

import React, { useState } from 'react';
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
    const [isConfirming, setIsConfirming] = useState(false);
    const Icon = iconType === 'restore' ? RotateCcw : Trash2;

    const handleAction = async (formData: FormData) => {
        setIsConfirming(false);
        try {
            const result = await action(formData);
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

    if (isConfirming) {
        return (
            <div className="inline-flex items-center space-x-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200 animate-in fade-in zoom-in duration-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Are you sure?</span>
                <form action={handleAction}>
                    <input type="hidden" name={type === 'client' ? 'clientId' : 'userId'} value={id} />
                    <button type="submit" className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold hover:bg-blue-700">
                        Yes
                    </button>
                </form>
                <button
                    onClick={() => setIsConfirming(false)}
                    className="text-slate-400 hover:text-slate-600 px-2 py-1 text-xs font-bold"
                >
                    No
                </button>
            </div>
        );
    }

    return (
        <button type="button" onClick={() => setIsConfirming(true)} className={className}>
            <Icon className="h-4 w-4 mr-1" /> {label}
        </button>
    );
}
