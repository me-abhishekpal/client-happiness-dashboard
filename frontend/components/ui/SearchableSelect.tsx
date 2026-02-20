'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface Option {
    value: string;
    label: string;
}

interface SearchableSelectProps {
    options: Option[];
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    name?: string;
    disabled?: boolean;
    className?: string; // Optional class override, defaults to branding aesthetic
}

export function SearchableSelect({
    options = [],
    value,
    onChange,
    placeholder = "Select an option...",
    name,
    disabled = false,
    className
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [internalValue, setInternalValue] = useState(value);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Sync with parent value if it changes
    useEffect(() => {
        setInternalValue(value);
    }, [value]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === internalValue);

    // Default branding classes
    const baseButtonClasses = "w-full flex items-center justify-between text-left bg-slate-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all disabled:opacity-70 disabled:bg-transparent shadow-sm disabled:shadow-none";

    return (
        <div className="relative w-full" ref={dropdownRef}>
            {/* Hidden input for native form submission */}
            {name && <input type="hidden" name={name} value={internalValue || ''} />}

            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                className={className || `${baseButtonClasses} ${!selectedOption ? 'text-slate-400' : 'text-slate-900 font-medium'}`}
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
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
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border-0 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto w-full p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-200">
                        {filteredOptions.length === 0 ? (
                            <div className="py-3 px-4 text-sm text-slate-500 text-center">
                                No results found.
                            </div>
                        ) : (
                            filteredOptions.map((option) => {
                                const isSelected = option.value === internalValue;
                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            setInternalValue(option.value);
                                            onChange?.(option.value);
                                            setIsOpen(false);
                                            setSearchTerm("");
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-lg transition-colors ${isSelected
                                            ? 'bg-emerald-50 text-emerald-700 font-bold'
                                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
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
