'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider } from '@/components/ui/Toast';
import { Project } from '@/types';

function ProjectsPageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchProjects();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data = await res.json();
                // Filter to only show projects assigned to this user
                const userProjects = data.filter((p: any) =>
                    p.trades?.some((t: any) => t.contractorId === session?.user.id)
                );
                setProjects(userProjects);
            }
        } catch (error) {
            console.error('Failed to load projects', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || !session) return null;

    return (
        <AppShell currentPage="settings">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-14 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            aria-label="Zurück" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted tap-active"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-headline text-foreground">Meine Projekte</h1>
                            <p className="text-sm text-muted-foreground">Ihre Projektzuweisungen</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-4">
                    {loading ? (
                        <div className="text-center py-16">
                            <div className="w-12 h-12 bg-accent rounded-xl animate-pulse mx-auto mb-4"></div>
                            <p className="text-muted-foreground">Laden...</p>
                        </div>
                    ) : projects.length === 0 ? (
                        <div className="card-mobile text-center py-12">
                            <span className="text-5xl block mb-3">🏗</span>
                            <p className="text-muted-foreground">Keine Projekte zugewiesen</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Die Bauleitung wird Sie zu Projekten hinzufügen.
                            </p>
                        </div>
                    ) : (
                        <>
                            <p className="text-sm text-muted-foreground px-1">
                                Sie sind {projects.length} Projekt{projects.length !== 1 ? 'en' : ''} zugewiesen
                            </p>

                            {projects.map((project) => {
                                // Find trades assigned to this user
                                const myTrades = project.trades?.filter(
                                    (t) => t.contractorId === session.user.id
                                ) || [];

                                return (
                                    <div key={project.id} className="card-mobile">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-foreground">{project.name}</h3>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {project.address}
                                                </p>
                                            </div>
                                            <span className="text-xs bg-accent/10 text-accent px-2 py-1 rounded-full">
                                                Aktiv
                                            </span>
                                        </div>

                                        {/* My Trades */}
                                        <div className="space-y-2">
                                            <p className="text-xs text-muted-foreground">IHRE GEWERKE:</p>
                                            {myTrades.map((trade) => (
                                                <div
                                                    key={trade.id}
                                                    className="flex items-center gap-2 py-2 px-3 bg-muted rounded-lg"
                                                >
                                                    <span className="text-lg">🔧</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-foreground text-sm">
                                                            {trade.name}
                                                        </p>
                                                        {trade.description && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {trade.description}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="text-xs text-muted-foreground">
                                                        {trade.tasks?.length || 0} Aufgaben
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}

                    {/* Info */}
                    <div className="card-mobile bg-blue-50 border-blue-100">
                        <div className="flex gap-3">
                            <span className="text-xl">ℹ️</span>
                            <div className="text-sm text-blue-800">
                                <p>
                                    Projektzuweisungen werden von der Bauleitung verwaltet.
                                    Bei Fragen wenden Sie sich an Ihren Projektleiter.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

export default function ProjectsPage() {
    return (
        <ToastProvider>
            <ProjectsPageContent />
        </ToastProvider>
    );
}
