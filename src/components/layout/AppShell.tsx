'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { OfflineIndicator } from '@/components/ui/OfflineIndicator';

interface AppShellProps {
    children: ReactNode;
    currentPage?: 'dashboard' | 'tasks' | 'photos' | 'diary' | 'activity' | 'contacts' | 'admin';
}

export function AppShell({ children, currentPage = 'dashboard' }: AppShellProps) {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div className="min-h-screen bg-background">
            {/* Offline Status Indicator */}
            <OfflineIndicator />

            {/* Desktop Sidebar - Fixed, hidden on mobile */}
            <aside className="hidden lg:block">
                <Sidebar currentPage={currentPage} />
            </aside>

            {/* Header - offset by sidebar width on desktop */}
            <Header />

            {/* Main Content - offset by sidebar on desktop */}
            <main className="lg:ml-56 pt-0 pb-20 lg:pb-8 min-h-screen">
                {children}
            </main>

            {/* Mobile Bottom Nav - hidden on desktop */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                <BottomNav currentPage={currentPage} />
            </nav>
        </div>
    );
}

