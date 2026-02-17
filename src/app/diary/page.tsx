'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { DiaryView } from '@/components/features/DiaryView';
import { Project, Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';
import { useProjectContext } from '@/lib/ProjectContext';

function DiaryPageContent() {
    const { data: session, status } = useSession();
    const role = session?.user?.role as Role | undefined;
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== 'authenticated') return;

        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) throw new Error('Fetch failed');
                const data: Project[] = await res.json();
                setProjects(data);
                if (!selectedProjectId && data.length > 0) {
                    setSelectedProjectId(data[0].id);
                }
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [status, selectedProjectId, setSelectedProjectId]);

    const project = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

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
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>
                    </div>
                    <p className="text-foreground font-medium mb-1">Kein Projekt vorhanden</p>
                    <p className="text-sm text-muted-foreground mb-4">Das Bautagebuch wird automatisch befüllt, sobald ein Projekt existiert.</p>
                    {role === 'architect' && <a href="/admin" className="text-sm text-accent font-medium hover:underline">Projekt anlegen</a>}
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
