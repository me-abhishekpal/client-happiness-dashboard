'use client';

import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
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
                <div className="relative w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search clients, regions..."
                        className="w-full pl-11 pr-4 py-2.5 bg-slate-100/50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                    />
                </div>

                <button className="relative p-2.5 bg-white rounded-full shadow-soft hover:bg-slate-50 transition-colors">
                    <Bell className="w-5 h-5 text-slate-600" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                <div className="flex items-center gap-3 pl-2">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-slate-800 leading-none">Alex Morgan</span>
                        <span className="text-[11px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">CSM Lead</span>
                    </div>
                    <div className="relative w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-soft">
                        {/* Using a placeholder avatar as image generation would be a separate step */}
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-400 font-bold">
                            AM
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
