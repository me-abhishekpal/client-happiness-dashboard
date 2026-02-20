// components/ActionableInsights.tsx
'use client';

import React from 'react';
import { MoreVertical } from 'lucide-react';
import Link from 'next/link';

export interface InsightData {
    id: string;
    name: string;
    industry: string;
    size: string;
    revenue: string;
    nps: number | null;
    kudos: number | null;
    lastTouch: string;
    status: 'RED' | 'AMBER' | 'GREEN' | 'UNKNOWN';
}

function InsightRow({ id, name, industry, size, revenue, nps, kudos, lastTouch, status }: InsightData) {
    const statusStyles = {
        'RED': 'bg-[#FF3B3015] text-[#FF3B30]',
        'AMBER': 'bg-[#FF950015] text-[#FF9500]',
        'GREEN': 'bg-[#34C75915] text-[#34C759]',
        'UNKNOWN': 'bg-slate-100 text-slate-500',
    };

    const displayStatus = status === 'RED' ? 'CRITICAL' : status === 'AMBER' ? 'AT RISK' : status === 'GREEN' ? 'HEALTHY' : 'UNKNOWN';

    const initial = name.charAt(0);
    const bgColors = ['bg-blue-100 text-blue-500', 'bg-purple-100 text-purple-500', 'bg-orange-100 text-orange-500', 'bg-emerald-100 text-emerald-500'];
    const charCode = name.charCodeAt(0);
    const avatarBg = bgColors[charCode % bgColors.length];

    const npsColor = nps && nps >= 50 ? 'text-emerald-500' : nps && nps < 0 ? 'text-red-500' : 'text-slate-600';

    return (
        <div className="flex items-center justify-between py-5 hover:bg-slate-50/50 px-4 rounded-3xl transition-colors cursor-pointer group">
            <div className="flex items-center gap-4 w-[25%]">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${avatarBg}`}>
                    {initial}
                </div>
                <div className="flex flex-col">
                    <Link href={`/clients/${encodeURIComponent(id)}`} className="font-bold text-slate-800 tracking-tight hover:text-blue-600 transition-colors">
                        {name}
                    </Link>
                    <span className="text-[11px] font-semibold text-slate-400 mt-0.5 tracking-wide uppercase">{industry || 'N/A'} • {size || 'N/A'}</span>
                </div>
            </div>

            <div className="w-[15%] text-left">
                <span className="text-[13px] font-bold text-slate-800 tracking-tight">{revenue}</span>
            </div>

            <div className="w-[10%] text-left pl-2">
                <span className={`text-[13px] font-bold ${npsColor}`}>
                    {nps !== null && nps !== undefined ? nps : '-'}
                </span>
            </div>

            <div className="w-[10%] text-left pl-2">
                <span className="text-[13px] font-bold text-emerald-600">
                    {kudos ? `+${kudos}` : '-'}
                </span>
            </div>

            <div className="w-[15%] text-left">
                <span className="text-[13px] font-bold text-slate-500">{lastTouch}</span>
            </div>

            <div className="w-[15%] text-left">
                <span className={`px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${statusStyles[status] || statusStyles['UNKNOWN']}`}>
                    {displayStatus}
                </span>
            </div>

            <div className="w-[10%] flex justify-end">
                <button className="p-2 text-slate-300 hover:text-slate-600 transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}

export function ActionableInsights({ insights }: { insights: InsightData[] }) {
    return (
        <div className="bg-white rounded-4xl p-10 shadow-soft border border-white/50 h-full">
            <div className="flex items-center justify-between mb-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${insights.some(i => i.status === 'RED') ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">Actionable Insights</h3>
                    </div>
                    <p className="text-slate-400 font-medium text-sm">Clients flagged for immediate review</p>
                </div>
                <Link href="/clients" className="text-blue-600 text-sm font-bold flex items-center group">
                    View All <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
            </div>

            <div className="overflow-x-auto -mx-10 px-10">
                <div className="min-w-[850px]">
                    <div className="flex items-center px-4 mb-6">
                        <span className="w-[25%] text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Client Entity</span>
                        <span className="w-[15%] text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Revenue Impact</span>
                        <span className="w-[10%] text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] pl-2">NPS</span>
                        <span className="w-[10%] text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em] pl-2">Kudos</span>
                        <span className="w-[15%] text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Last Touch</span>
                        <span className="w-[15%] text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Status</span>
                        <span className="w-[10%] text-right text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Action</span>
                    </div>

                    <div className="space-y-2">
                        {insights.length > 0 ? (
                            insights.map((insight) => (
                                <InsightRow key={insight.id} {...insight} />
                            ))
                        ) : (
                            <p className="text-center py-10 text-slate-400 font-medium italic">No immediate insights to show.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
