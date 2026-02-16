'use client';

import React from 'react';
import { Bell } from 'lucide-react';
import Image from 'next/image';

export function TopNav() {
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex flex-col">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-600 p-1.5 rounded-lg">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Client Happiness</h1>
                </div>
                <p className="text-slate-400 text-sm font-medium ml-9 -mt-1">Real-time enterprise RAG tracking</p>
            </div>

            <div className="flex items-center gap-6">
                <button className="relative p-2.5 bg-white rounded-full shadow-soft hover:bg-slate-50 transition-colors">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>
            </div>
        </header>
    );
}
