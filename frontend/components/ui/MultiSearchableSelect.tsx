'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface MultiSearchableSelectProps {
    options: Option[];
    values?: string[];
    onChange?: (values: string[]) => void;
    placeholder?: string;
    name?: string;        // if set, renders hidden inputs for form submission
    disabled?: boolean;
}

export function MultiSearchableSelect({
    options = [],
    values = [],
    onChange,
    placeholder = 'Select options...',
    name,
    disabled = false,
}: MultiSearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [internalValues, setInternalValues] = useState<string[]>(values);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync with parent values if they change
    useEffect(() => {
        setInternalValues(values);
    }, [values]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(o =>
        o.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function toggle(value: string) {
        const next = internalValues.includes(value)
            ? internalValues.filter(v => v !== value)
            : [...internalValues, value];
        setInternalValues(next);
        onChange?.(next);
    }

    function remove(value: string, e: React.MouseEvent) {
        e.stopPropagation();
        const next = internalValues.filter(v => v !== value);
        setInternalValues(next);
        onChange?.(next);
    }

    const selectedOptions = options.filter(o => internalValues.includes(o.value));

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Hidden inputs for native form submission */}
            {name && internalValues.map(v => (
                <input key={v} type="hidden" name={name} value={v} />
            ))}
            {/* Trigger */}
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={`w-full flex flex-wrap items-center gap-1.5 text-left bg-slate-50 border-0 rounded-xl px-3 py-2.5 min-h-[44px] focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-transparent shadow-sm disabled:shadow-none`}
            >
                {selectedOptions.length === 0 ? (
                    <span className="text-sm text-slate-400 flex-1">{placeholder}</span>
                ) : (
                    selectedOptions.map(opt => (
                        <span key={opt.value} className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg">
                            {opt.label}
                            {!disabled && (
                                <button type="button" onClick={e => remove(opt.value, e)} className="text-emerald-500 hover:text-emerald-700 ml-0.5">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </span>
                    ))
                )}
                <ChevronDown className={`w-4 h-4 text-slate-400 ml-auto shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2 border-b border-slate-50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                autoFocus
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>
                    <div className="max-h-52 overflow-y-auto p-2 space-y-0.5">
                        {filteredOptions.length === 0 ? (
                            <div className="py-3 px-4 text-sm text-slate-500 text-center">No results found.</div>
                        ) : (
                            filteredOptions.map(option => {
                                const isSelected = internalValues.includes(option.value);
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => toggle(option.value)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${isSelected
                                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                                            : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span className="truncate">{option.label}</span>
                                        {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
