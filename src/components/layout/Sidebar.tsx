'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Role } from '@/types';

interface SidebarProps {
    currentPage: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
    const { data: session } = useSession();
    const role = session?.user?.role as Role | undefined;

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: '🏠', href: '/' },
        { id: 'tasks', label: 'Aufgaben', icon: '📋', href: '/tasks', hideFor: ['client'] as Role[] },
        { id: 'photos', label: 'Fotos', icon: '📷', href: '/photos' },
        { id: 'diary', label: 'Bautagebuch', icon: '📓', href: '/diary' },
        { id: 'contacts', label: 'Kontakte', icon: '👥', href: '/contacts', hideFor: ['contractor'] as Role[] },
        { id: 'activity', label: 'Aktivität', icon: '🔔', href: '/activity', hideFor: ['client'] as Role[] },
        { id: 'admin', label: 'Verwaltung', icon: '⚙️', href: '/admin', hideFor: ['client', 'contractor'] as Role[] },
    ];

    const visibleItems = menuItems.filter(item => !role || !item.hideFor?.includes(role));

    return (
        <div className="flex flex-col h-full py-4">
            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
                {visibleItems.map((item) => {
                    const isActive = currentPage === item.id;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                }
              `}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                            {item.id === 'activity' && (
                                <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                                    3
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="px-3 pt-4 border-t border-gray-100">
                <div className="px-4 py-3 text-xs text-gray-400">
                    <p>BauProject Timeline</p>
                    <p className="mt-1">Version 3.0</p>
                </div>
            </div>
        </div>
    );
}
