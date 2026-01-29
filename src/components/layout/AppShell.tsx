'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

interface AppShellProps {
    children: ReactNode;
    currentPage?: 'dashboard' | 'tasks' | 'photos' | 'diary' | 'activity';
}

export function AppShell({ children, currentPage = 'dashboard' }: AppShellProps) {
    const { data: session } = useSession();

    if (!session) return null;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="flex">
                {/* Desktop Sidebar - hidden on mobile */}
                <aside className="hidden lg:block w-64 fixed left-0 top-16 h-[calc(100vh-4rem)] border-r border-gray-200 bg-white">
                    <Sidebar currentPage={currentPage} />
                </aside>

                {/* Main Content */}
                <main className="flex-1 lg:ml-64 pb-20 lg:pb-8">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Nav - hidden on desktop */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
                <BottomNav currentPage={currentPage} />
            </nav>
        </div>
    );
}
