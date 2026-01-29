'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Role } from '@/types';

interface BottomNavProps {
    currentPage: string;
}

export function BottomNav({ currentPage }: BottomNavProps) {
    const { data: session } = useSession();
    const role = session?.user?.role as Role | undefined;

    const menuItems = [
        { id: 'dashboard', label: 'Home', icon: '🏠', href: '/' },
        { id: 'tasks', label: 'Tasks', icon: '📋', href: '/tasks', hideFor: ['client'] as Role[] },
        { id: 'photos', label: 'Fotos', icon: '📷', href: '/photos' },
        { id: 'contacts', label: 'Kontakte', icon: '👥', href: '/contacts', hideFor: ['contractor'] as Role[] },
        { id: 'diary', label: 'Diary', icon: '📓', href: '/diary' },
        { id: 'activity', label: 'Feed', icon: '🔔', href: '/activity', hideFor: ['client'] as Role[] },
    ];

    const visibleItems = menuItems.filter(item => !role || !item.hideFor?.includes(role));

    return (
        <div className="bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center safe-area-bottom">
            {visibleItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`
              flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 min-w-[60px]
              ${isActive
                                ? 'text-blue-600'
                                : 'text-gray-400 hover:text-gray-600'
                            }
            `}
                    >
                        <span className="text-xl relative">
                            {item.icon}
                            {item.id === 'activity' && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    3
                                </span>
                            )}
                        </span>
                        <span className={`text-[10px] font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
