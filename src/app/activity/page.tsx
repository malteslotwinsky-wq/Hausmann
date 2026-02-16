'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { ActivityFeed } from '@/components/features/ActivityFeed';
import { Project, Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';
import { useProjectContext } from '@/lib/ProjectContext';

function ActivityPageContent() {
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
    }, [status]);

    const project = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

    if (status === 'loading' || !session || loading) {
        return (
            <AppShell currentPage="activity">
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-muted-foreground">Laden...</div>
                </div>
            </AppShell>
        );
    }

    if (role === 'client') {
        return (
            <AppShell currentPage="activity">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    </div>
                    <p className="text-foreground font-medium mb-1">Nur für Bauleitung & Handwerker</p>
                    <p className="text-sm text-muted-foreground mb-4">Der Aktivitätsfeed ist für Kunden nicht sichtbar.</p>
                    <a href="/dashboard" className="text-sm text-accent font-medium hover:underline">Zum Dashboard</a>
                </div>
            </AppShell>
        );
    }

    if (!project) {
        return (
            <AppShell currentPage="activity">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                    </div>
                    <p className="text-foreground font-medium mb-1">Kein Projekt vorhanden</p>
                    <p className="text-sm text-muted-foreground mb-4">Aktivitäten werden angezeigt, sobald Projekte mit Aufgaben existieren.</p>
                    {role === 'architect' && <a href="/admin" className="text-sm text-accent font-medium hover:underline">Projekt anlegen</a>}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell currentPage="activity">
            <div className="max-w-3xl mx-auto p-4">
                <ActivityFeed project={project} role={role!} currentUserId={session.user.id} />
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
