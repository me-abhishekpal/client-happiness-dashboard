'use client';

import React from 'react';
import { ArrowUpRight, ArrowRight, TrendingUp } from 'lucide-react';

interface StatProps {
    label: string;
    value: number;
    description: string;
    type: 'critical' | 'at-risk' | 'healthy';
}

function StatCard({ label, value, description, type }: StatProps) {
    const styles = {
        critical: {
            bg: 'bg-[#FFF5F5]',
            badge: 'bg-[#FF3B3015] text-[#FF3B30]',
            val: 'text-[#FF3B30]',
            icon: (
                <svg className="absolute top-4 right-4 w-24 h-24 text-[#FF3B3008]" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50 15L85 75H15L50 15Z" />
                    <rect x="47" y="40" width="6" height="15" />
                    <circle cx="50" cy="62" r="3" />
                </svg>
            ),
            arrow: <ArrowUpRight className="w-5 h-5 text-[#FF3B30]" />
        },
        'at-risk': {
            bg: 'bg-[#FFF9F2]',
            badge: 'bg-[#FF950015] text-[#FF9500]',
            val: 'text-[#FF9500]',
            icon: (
                <svg className="absolute top-4 right-4 w-24 h-24 text-[#FF950008]" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="35" />
                    <rect x="35" y="47" width="30" height="6" rx="3" />
                </svg>
            ),
            arrow: <ArrowRight className="w-5 h-5 text-[#FF9500]" />
        },
        healthy: {
            bg: 'bg-[#F2FBF4]',
            badge: 'bg-[#34C75915] text-[#34C759]',
            val: 'text-[#34C759]',
            icon: (
                <svg className="absolute top-4 right-4 w-24 h-24 text-[#34C75908]" viewBox="0 0 100 100" fill="currentColor">
                    <circle cx="50" cy="50" r="35" />
                    <path d="M35 50 C 35 60, 65 60, 65 50" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="40" cy="40" r="3" />
                    <circle cx="60" cy="40" r="3" />
                </svg>
            ),
            arrow: <TrendingUp className="w-5 h-5 text-[#34C759]" />
        }
    };

    const current = styles[type];

    return (
        <div className={`${current.bg} p-10 rounded-4xl relative overflow-hidden shadow-soft border border-white/50 group hover:shadow-xl transition-all duration-500 flex flex-col justify-between min-h-[280px]`}>
            {current.icon}

            <div className="relative z-10">
                <div className="flex justify-between items-start">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${current.badge}`}>
                        {label}
                    </span>
                    <div className="p-2 bg-white/60 backdrop-blur-md rounded-full group-hover:bg-white transition-colors cursor-pointer">
                        {current.arrow}
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className={`text-7xl font-bold tracking-tight ${current.val}`}>{value}</h2>
                    <p className="mt-4 text-slate-500 font-medium text-lg leading-relaxed max-w-[200px]">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function DashboardStats({ counts }: { counts: { critical: number, atRisk: number, healthy: number } }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard
                label="Critical"
                value={counts.critical}
                description="Clients requiring immediate action"
                type="critical"
            />
            <StatCard
                label="At Risk"
                value={counts.atRisk}
                description="Watchlist clients showing churn signs"
                type="at-risk"
            />
            <StatCard
                label="Healthy"
                value={counts.healthy}
                description="Clients with positive sentiment"
                type="healthy"
            />
        </div>
    );
}
