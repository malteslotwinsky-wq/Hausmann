'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Role } from '@/types';
import { defaultTheme } from '@/lib/branding';

interface SidebarProps {
    currentPage: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
    const { data: session } = useSession();
    const role = session?.user?.role as Role | undefined;

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard' },
        { id: 'tasks', label: 'Aufgaben', icon: '✓', href: '/tasks', hideFor: ['client'] as Role[] },
        { id: 'photos', label: 'Fotos', icon: '📷', href: '/photos' },
        { id: 'diary', label: 'Bautagebuch', icon: '📓', href: '/diary' },
        { id: 'contacts', label: 'Kontakte', icon: '👥', href: '/contacts', hideFor: ['contractor'] as Role[] },
        { id: 'activity', label: 'Aktivität', icon: '🔔', href: '/activity', hideFor: ['client'] as Role[] },
        { id: 'admin', label: 'Verwaltung', icon: '⚙️', href: '/admin', hideFor: ['client', 'contractor'] as Role[] },
    ];

    const visibleItems = menuItems.filter(item => !role || !item.hideFor?.includes(role));

    return (
        <div className="w-56 bg-slate-900 text-white flex flex-col h-screen fixed left-0 top-0 z-50 transition-colors duration-300">
            {/* Logo / Brand */}
            <div className="p-5 border-b border-white/10">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center">
                        <span className="text-white text-lg font-bold">B</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight">{defaultTheme.name}</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => {
                    const isActive = currentPage === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                ${isActive
                                    ? 'bg-accent text-white'
                                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            <span className="text-lg">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/10">
                <div className="text-xs text-white/40">
                    <p>{defaultTheme.name}</p>
                    <p className="mt-1">Version 3.0</p>
                </div>
            </div>
        </div>
    );
}
