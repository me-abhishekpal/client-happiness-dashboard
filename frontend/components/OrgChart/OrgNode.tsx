'use client';

import React from 'react';
import { UserPlus, Pencil, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserNode {
    id: string;
    name: string | null;
    email: string;
    titleRel?: { name: string } | null;
    roleRel?: { name: string } | null;
    directReports?: UserNode[];
}

interface OrgNodeProps {
    user: UserNode;
}

export function OrgNode({ user }: OrgNodeProps) {
    const router = useRouter();
    const initials = user.name
        ?.split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '??';

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        // Navigate to edit page with returnUrl
        router.push(`/admin/users?editId=${user.id}&returnUrl=/admin/org-chart`);
    };

    return (
        <div className="relative group/card flex flex-col items-center">
            {/* Connector Line Logic handled by parent tree */}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 min-w-[200px] hover:shadow-md hover:border-blue-300 transition-all cursor-pointer relative z-10"
                onClick={handleEdit}>

                <div className="flex items-center space-x-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border-2 border-white shadow-sm">
                        {initials}
                    </div>
                    <div className="text-left">
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{user.name || 'Unnamed'}</h4>
                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">
                            {user.titleRel?.name || 'No Title'}
                        </p>
                    </div>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 font-bold">
                        {user.roleRel?.name || 'VIEWER'}
                    </span>

                    <button
                        onClick={handleEdit}
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                        <Pencil className="h-3 w-3" />
                    </button>
                </div>

                {/* Hover Add Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Pre-fill managerId
                        router.push(`/admin/users?managerId=${user.id}&returnUrl=/admin/org-chart`);
                    }}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover/card:opacity-100 transition-opacity hover:scale-110"
                    title="Add Direct Report"
                >
                    <UserPlus className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}
