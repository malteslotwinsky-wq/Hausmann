'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { DiaryView } from '@/components/features/DiaryView';
import { Project, Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';

function DiaryPageContent() {
    const { data: session, status } = useSession();
    const role = session?.user?.role as Role | undefined;
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== 'authenticated') return;

        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) throw new Error('Fetch failed');
                const projects: Project[] = await res.json();
                if (projects.length > 0) {
                    setProject(projects[0]);
                }
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [status]);

    if (status === 'loading' || !session || loading) {
        return (
            <AppShell currentPage="diary">
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-muted-foreground">Laden...</div>
                </div>
            </AppShell>
        );
    }

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
