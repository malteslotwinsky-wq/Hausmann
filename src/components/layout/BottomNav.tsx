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
        { id: 'admin', label: 'Admin', icon: '⚡', href: '/admin', hideFor: ['client', 'contractor'] as Role[] }, // Direct mobile admin access
        { id: 'activity', label: 'Feed', icon: '🔔', href: '/activity', hideFor: ['client'] as Role[] },
    ];

    const visibleItems = menuItems.filter(item => !role || !item.hideFor?.includes(role));

    // Limit to 5 items max on mobile for spacing, prioritizing Admin for Architects
    const mobileItems = visibleItems.slice(0, 5);

    return (
        <div className="bg-white border-t border-border py-2 px-4 flex justify-around items-center safe-area-bottom z-50">
            {mobileItems.map((item) => {
                const isActive = currentPage === item.id;
                return (
                    <Link
                        key={item.id}
                        href={item.href}
                        className={`
              flex flex-col items-center gap-1 px-2 py-2 rounded-sm transition-all duration-200 min-w-[60px]
              ${isActive
                                ? 'text-primary'
                                : 'text-muted-foreground hover:text-foreground'
                            }
            `}
                    >
                        <span className="text-xl relative">
                            {item.icon}
                            {item.id === 'activity' && (
                                <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    3
                                </span>
                            )}
                        </span>
                        <span className={`text-[10px] font-medium tracking-wide uppercase ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
}
