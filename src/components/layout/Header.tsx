'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Role } from '@/types';
import { defaultTheme } from '@/lib/branding';

export function Header() {
    const { data: session } = useSession();

    if (!session) return null;

    const user = session.user;
    const role = user.role as Role;

    const roleLabels = {
        client: 'Bauherr',
        architect: 'Bauleitung',
        contractor: 'Handwerker',
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-border h-16 ml-56">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Left: Page Title Area (can be set dynamically) */}
                <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold text-primary">Dashboard</h2>
                    <span className="text-sm text-muted-foreground px-2 py-0.5 bg-gray-100 rounded-md">
                        ({roleLabels[role]})
                    </span>
                </div>

                {/* Right: User Actions */}
                <div className="flex items-center gap-4">
                    {/* Notification Bell */}
                    <button className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-xl">🔔</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>

                    {/* User Avatar & Name */}
                    <div className="flex items-center gap-3 pl-4 border-l border-border">
                        <div className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-sm font-medium text-primary">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="text-sm text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Abmelden
                    </button>
                </div>
            </div>
        </header>
    );
}
