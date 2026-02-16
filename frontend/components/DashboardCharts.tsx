// components/DashboardCharts.tsx
'use client';

import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { AlertCircle, Heart, Quote, TrendingUp } from 'lucide-react';

const trendData = [
    { value: 40 }, { value: 38 }, { value: 42 }, { value: 41 },
    { value: 45 }, { value: 48 }, { value: 55 }, { value: 52 },
    { value: 58 }, { value: 65 }, { value: 68 }, { value: 72 },
];

export function HappinessTrend() {
    return (
        <div className="bg-[#F6F4FF] rounded-4xl p-8 shadow-soft border border-white/50 h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 tracking-tight">Happiness Trend</h3>
                    <p className="text-slate-400 font-medium text-[11px] mt-1">Last 30 days average</p>
                </div>
                <div className="bg-[#34C75915] text-[#34C759] px-2 py-1 rounded-full text-[10px] font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +4.2%
                </div>
            </div>

            <div className="flex-1 mt-4">
                <ResponsiveContainer width="100%" height={120}>
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#7C3AED"
                            strokeWidth={4}
                            fillOpacity={1}
                            fill="url(#colorTrend)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export interface EscalationData {
    id: string;
    title: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    clientName: string;
}

export function DisasterWarning({ escalations }: { escalations: EscalationData[] }) {
    return (
        <div className="bg-[#FFF5F5] rounded-4xl p-8 shadow-soft border border-white/50 h-full">
            <div className="flex items-center gap-2 mb-6 text-[#FF3B30]">
                <AlertCircle className="w-5 h-5 fill-current" />
                <h3 className="text-lg font-bold tracking-tight text-slate-800">Disaster Early Warning</h3>
            </div>

            <div className="space-y-6">
                {escalations.length > 0 ? (
                    escalations.map((esc) => (
                        <div key={esc.id} className="bg-white/40 p-5 rounded-3xl border border-white/60">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[13px] font-bold text-slate-800">{esc.title}</span>
                                <span className={`${esc.severity === 'HIGH' ? 'bg-[#FF3B30]' :
                                        esc.severity === 'MEDIUM' ? 'bg-[#FF9500]' : 'bg-blue-500'
                                    } text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase`}>
                                    {esc.severity}
                                </span>
                            </div>
                            <p className="text-slate-500 text-[12px] leading-relaxed">Impacted Client: {esc.clientName}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center py-10 text-slate-400 font-medium italic">All systems clear. No open escalations.</p>
                )}
            </div>
        </div>
    );
}

export function KudosNPS({ nps, kudos }: { nps: number, kudos: number }) {
    return (
        <div className="bg-[#F2FBF4] rounded-4xl p-8 shadow-soft border border-white/50 h-full flex flex-col">
            <div className="flex items-center gap-2 mb-8 text-[#34C759]">
                <Heart className="w-5 h-5 fill-current" />
                <h3 className="text-lg font-bold tracking-tight text-slate-800">Recent Kudos & NPS</h3>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/60 p-5 rounded-3xl border border-white flex flex-col items-center text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">NPS Score</span>
                    <span className="text-3xl font-extrabold text-[#34C759]">{nps || '--'}</span>
                </div>
                <div className="bg-white/60 p-5 rounded-3xl border border-white flex flex-col items-center text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recent Kudos</span>
                    <span className="text-3xl font-extrabold text-blue-500">{kudos || '0'}</span>
                </div>
            </div>

            <div className="bg-white/80 p-6 rounded-3xl border border-white/60 relative italic text-slate-600 text-[13px] leading-relaxed flex-1 flex items-center">
                <Quote className="w-4 h-4 text-[#34C75930] absolute top-4 left-4 rotate-180" />
                "The new update is phenomenal. Service quality has improved significantly over the last sprint."
            </div>
        </div>
    );
}

export interface PerformanceDept {
    name: string;
    value: number;
    color: string;
}

export function DeptPerformance({ performance }: { performance: PerformanceDept[] }) {
    return (
        <div className="bg-[#FFF9F2] rounded-4xl p-8 shadow-soft border border-white/50 h-full flex flex-col">
            <div className="mb-2">
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Dept. Performance</h3>
                <p className="text-slate-400 font-medium text-[11px]">CSAT by internal department</p>
            </div>

            <div className="mt-8 space-y-6 flex-1 flex flex-col justify-center">
                {performance.length > 0 ? (
                    performance.map((dept) => (
                        <div key={dept.name}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[12px] font-bold text-slate-600 tracking-tight">{dept.name}</span>
                                <span className="text-[12px] font-extrabold text-slate-800">{dept.value}%</span>
                            </div>
                            <div className="w-full bg-white/50 h-2.5 rounded-full overflow-hidden border border-white shadow-inner">
                                <div
                                    className={`${dept.color} h-full rounded-full transition-all duration-1000`}
                                    style={{ width: `${dept.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-400 text-center py-10 opacity-50 italic">Waiting for departmental data...</p>
                )}
            </div>
        </div>
    );
}
