'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role } from '@/types';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);

    if (!session) return null;

    const user = session.user;
    const role = user.role as Role;

    const roleLabels = {
        client: 'Bauherr',
        architect: 'Bauleitung',
        contractor: 'Handwerker',
    };

    const getPageTitle = () => {
        if (pathname?.includes('/dashboard')) return 'Dashboard';
        if (pathname?.includes('/tasks')) return 'Aufgaben';
        if (pathname?.includes('/photos')) return 'Fotos';
        if (pathname?.includes('/diary')) return 'Bautagebuch';
        if (pathname?.includes('/contacts')) return 'Kontakte';
        if (pathname?.includes('/activity')) return 'Aktivität';
        if (pathname?.includes('/admin')) return 'Verwaltung';
        if (pathname?.includes('/settings')) return 'Einstellungen';
        return 'Dashboard';
    };

    return (
        <header className="sticky top-0 z-40 bg-surface/70 backdrop-blur-xl border-b border-border h-14 lg:ml-56 transition-colors duration-200">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left: Page Title */}
                <div className="flex items-center gap-3">
                    {/* Mobile Logo */}
                    <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 21h18" />
                                <path d="M5 21V7l7-4 7 4v14" />
                                <path d="M9 21v-6h6v6" />
                            </svg>
                        </div>
                    </Link>
                    <h2 className="text-[15px] font-semibold text-foreground hidden sm:block">{getPageTitle()}</h2>
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md hidden sm:inline font-medium">
                        {roleLabels[role]}
                    </span>
                </div>

                {/* Right: User Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Notification Bell */}
                    <Link
                        href="/settings/notifications"
                        aria-label="Benachrichtigungen"
                        className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors tap-active"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </Link>

                    {/* User Avatar with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-2 sm:gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-muted transition-colors tap-active"
                        >
                            <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center font-semibold text-sm ring-1 ring-accent/20 hover:ring-accent/30 transition-all">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-foreground leading-tight">{user.name}</p>
                                <p className="text-[11px] text-muted-foreground">{roleLabels[role]}</p>
                            </div>
                            <svg className="hidden sm:block text-muted-foreground" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {/* Profile Dropdown */}
                        <ProfileDropdown
                            isOpen={showProfileDropdown}
                            onClose={() => setShowProfileDropdown(false)}
                            userName={user.name || 'Benutzer'}
                            userEmail={user.email || undefined}
                            userRole={role}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
