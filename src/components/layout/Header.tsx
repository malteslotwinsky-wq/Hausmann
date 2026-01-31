'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/types';
import { defaultTheme } from '@/lib/branding';

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();

    if (!session) return null;

    const user = session.user;
    const role = user.role as Role;

    const roleLabels = {
        client: 'Bauherr',
        architect: 'Bauleitung',
        contractor: 'Handwerker',
    };

    // Get page title based on pathname
    const getPageTitle = () => {
        if (pathname?.includes('/dashboard')) return 'Dashboard';
        if (pathname?.includes('/tasks')) return 'Aufgaben';
        if (pathname?.includes('/photos')) return 'Fotos';
        if (pathname?.includes('/diary')) return 'Bautagebuch';
        if (pathname?.includes('/contacts')) return 'Kontakte';
        if (pathname?.includes('/activity')) return 'Aktivität';
        if (pathname?.includes('/admin')) return 'Verwaltung';
        return 'Dashboard';
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-border h-14 lg:ml-56">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left: Page Title */}
                <div className="flex items-center gap-3">
                    {/* Mobile Logo */}
                    <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">B</span>
                        </div>
                    </Link>
                    <h2 className="text-base font-semibold text-foreground hidden sm:block">{getPageTitle()}</h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md hidden sm:inline">
                        {roleLabels[role]}
                    </span>
                </div>

                {/* Right: User Actions */}
                <div className="flex items-center gap-2 sm:gap-4">
                    {/* Notification Bell - hidden on mobile, shown in bottom nav */}
                    <button className="hidden sm:flex relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors tap-active">
                        <span className="text-lg">🔔</span>
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full"></span>
                    </button>

                    {/* User Avatar */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-xs">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="hidden md:block">
                            <p className="text-sm font-medium text-foreground leading-tight">{user.name}</p>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-lg hover:bg-muted transition-colors tap-active hidden sm:block"
                    >
                        Abmelden
                    </button>
                </div>
            </div>
        </header>
    );
}
