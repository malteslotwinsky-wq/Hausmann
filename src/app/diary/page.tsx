'use client';

import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { DiaryView } from '@/components/features/DiaryView';
import { demoProjects } from '@/lib/demo-data';
import { Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';

function DiaryPageContent() {
    const { data: session, status } = useSession();
    const role = session?.user?.role as Role | undefined;

    if (status === 'loading' || !session) {
        return null;
    }

    // Get accessible projects based on user role
    const accessibleProjects = role === 'client' && session.user.projectIds
        ? demoProjects.filter(p => session.user.projectIds?.includes(p.id))
        : demoProjects;

    // Use first accessible project
    const project = accessibleProjects[0];

    if (!project) {
        return (
            <AppShell currentPage="diary">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <span className="text-6xl block mb-4">📓</span>
                    <p className="text-gray-500">Kein Projekt verfügbar</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell currentPage="diary">
            <div className="max-w-4xl mx-auto p-4">
                <DiaryView project={project} isClientView={role === 'client'} />
            </div>
        </AppShell>
    );
}

export default function DiaryPage() {
    return (
        <ToastProvider>
            <DiaryPageContent />
        </ToastProvider>
    );
}
