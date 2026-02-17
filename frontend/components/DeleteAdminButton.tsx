'use client';

import React from 'react';

interface DeleteAdminButtonProps {
    adminId: string;
    onDelete: (formData: FormData) => Promise<void>;
}

export function DeleteAdminButton({ adminId, onDelete }: DeleteAdminButtonProps) {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (window.confirm('Are you sure you want to remove this administrator? This action cannot be undone.')) {
            const formData = new FormData(e.currentTarget);
            await onDelete(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="hidden" name="adminId" value={adminId} />
            <button
                type="submit"
                className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                title="Delete Administrator"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
            </button>
        </form>
    );
}
