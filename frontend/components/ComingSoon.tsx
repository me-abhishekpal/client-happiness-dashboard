import React from 'react';
import { Construction } from 'lucide-react';

export function ComingSoon({ title, description }: { title: string, description?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="w-20 h-20 bg-brand-primary/10 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Construction className="w-10 h-10 text-brand-primary" />
            </div>

            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">
                {title}
            </h1>

            <p className="text-lg text-slate-500 max-w-lg mx-auto leading-relaxed">
                {description || "We are currently building this feature. Check back soon for updates to your dashboard experience."}
            </p>

            <div className="mt-10 px-6 py-3 bg-white border border-slate-100 rounded-full shadow-sm">
                <p className="text-sm font-bold text-brand-primary uppercase tracking-widest">
                    Coming Soon
                </p>
            </div>
        </div>
    );
}
