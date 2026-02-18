'use client';

import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
    value: string;
    label: string;
    subtitle?: string;
}

interface SelectFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    emptyLabel?: string;
}

export function SelectField({
    label,
    value,
    onChange,
    options,
    placeholder = 'Auswählen...',
    emptyLabel = 'Keine Auswahl',
}: SelectFieldProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const selected = options.find(o => o.value === value);
    const showSearch = options.length > 5;

    const filtered = search
        ? options.filter(o =>
            o.label.toLowerCase().includes(search.toLowerCase()) ||
            (o.subtitle && o.subtitle.toLowerCase().includes(search.toLowerCase()))
        )
        : options;

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClick = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
                setSearch('');
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen]);

    // Focus search when opened
    useEffect(() => {
        if (isOpen && showSearch) {
            setTimeout(() => searchRef.current?.focus(), 50);
        }
    }, [isOpen, showSearch]);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div className="card-mobile relative" ref={containerRef}>
            <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/50 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-left"
            >
                {selected ? (
                    <>
                        <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold flex-shrink-0">
                            {selected.label.charAt(0).toUpperCase()}
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-base text-foreground truncate">{selected.label}</p>
                            {selected.subtitle && (
                                <p className="text-xs text-muted-foreground truncate">{selected.subtitle}</p>
                            )}
                        </div>
                    </>
                ) : (
                    <span className="flex-1 text-base text-muted-foreground">{placeholder}</span>
                )}
                <svg
                    className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-surface border border-border rounded-xl shadow-lg overflow-hidden animate-fade-in">
                    {showSearch && (
                        <div className="p-2 border-b border-border">
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Suchen..."
                                className="w-full px-3 py-2 rounded-lg border border-border bg-muted/50 text-sm outline-none focus:border-accent"
                            />
                        </div>
                    )}
                    <div className="max-h-60 overflow-y-auto overscroll-contain">
                        {/* Empty option */}
                        <button
                            type="button"
                            onClick={() => handleSelect('')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-left tap-active transition-colors ${!value ? 'bg-accent/10' : 'hover:bg-muted'}`}
                        >
                            <span className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground text-sm flex-shrink-0">
                                —
                            </span>
                            <span className="text-sm text-muted-foreground flex-1">{emptyLabel}</span>
                            {!value && <Checkmark />}
                        </button>

                        {filtered.map(option => {
                            const isSelected = option.value === value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => handleSelect(option.value)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-left tap-active transition-colors ${isSelected ? 'bg-accent/10' : 'hover:bg-muted'}`}
                                >
                                    <span className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground text-sm font-bold flex-shrink-0">
                                        {option.label.charAt(0).toUpperCase()}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{option.label}</p>
                                        {option.subtitle && (
                                            <p className="text-xs text-muted-foreground truncate">{option.subtitle}</p>
                                        )}
                                    </div>
                                    {isSelected && <Checkmark />}
                                </button>
                            );
                        })}

                        {filtered.length === 0 && (
                            <p className="px-4 py-6 text-sm text-muted-foreground text-center">Keine Treffer</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Checkmark() {
    return (
        <svg className="w-5 h-5 text-accent flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    );
}
