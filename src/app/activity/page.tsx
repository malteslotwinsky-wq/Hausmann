'use client';

import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { ActivityFeed } from '@/components/features/ActivityFeed';
import { demoProjects } from '@/lib/demo-data';
import { Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';

function ActivityPageContent() {
    const { data: session, status } = useSession();
    const role = session?.user?.role as Role | undefined;

    if (status === 'loading' || !session) {
        return null;
    }

    // Clients shouldn't see activity feed - middleware handles redirect
    if (role === 'client') {
        return (
            <AppShell currentPage="activity">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <span className="text-6xl block mb-4">🔒</span>
                    <p className="text-gray-500">Diese Seite ist für Kunden nicht verfügbar.</p>
                </div>
            </AppShell>
        );
    }

    // Use first project  
    const project = demoProjects[0];

    return (
        <AppShell currentPage="activity">
            <div className="max-w-3xl mx-auto p-4">
                <ActivityFeed project={project} role={role!} />
            </div>
        </AppShell>
    );
}

export default function ActivityPage() {
    return (
        <ToastProvider>
            <ActivityPageContent />
        </ToastProvider>
    );
}
