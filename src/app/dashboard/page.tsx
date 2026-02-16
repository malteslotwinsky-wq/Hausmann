'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ClientDashboard } from '@/components/views/ClientDashboard';
import { ArchitectDashboard } from '@/components/views/ArchitectDashboard';
import { ContractorDashboard } from '@/components/views/ContractorDashboard';
import { ProjectList } from '@/components/features/ProjectList';
import { Project, TaskStatus, Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';
import { useProjectContext } from '@/lib/ProjectContext';

function DashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showProjectList, setShowProjectList] = useState(true);
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();

    const user = session?.user;
    const role = user?.role as Role | undefined;

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProjects();
        }
    }, [status]);

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data: any[] = await res.json();

                const parsedProjects: Project[] = data.map(p => ({
                    ...p,
                    startDate: new Date(p.startDate),
                    targetEndDate: new Date(p.targetEndDate),
                    createdAt: new Date(p.createdAt),
                    updatedAt: new Date(p.updatedAt),
                    trades: p.trades.map((t: any) => ({
                        ...t,
                        tasks: t.tasks.map((task: any) => ({
                            ...task,
                            createdAt: new Date(task.createdAt),
                            updatedAt: new Date(task.updatedAt),
                        }))
                    }))
                }));

                let accessibleProjects = parsedProjects;
                if (role === 'client' && user?.projectIds) {
                    accessibleProjects = parsedProjects.filter(p => user.projectIds?.includes(p.id));
                }
                setProjects(accessibleProjects);

                // Sync with ProjectContext
                if (selectedProjectId) {
                    const found = accessibleProjects.find(p => p.id === selectedProjectId);
                    if (found) {
                        setSelectedProject(found);
                        setShowProjectList(false);
                    }
                }

                if (!selectedProjectId && accessibleProjects.length > 0) {
                    setSelectedProjectId(accessibleProjects[0].id);
                }

                if (role === 'client' && accessibleProjects.length === 1) {
                    setSelectedProject(accessibleProjects[0]);
                    setShowProjectList(false);
                }
            }
        } catch (error) {
            console.error('Failed to load projects', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-white text-2xl font-bold">B</span>
                    </div>
                    <p className="text-muted-foreground">Laden...</p>
                </div>
            </div>
        );
    }

    if (!session || !user) {
        router.push('/login');
        return null;
    }

    const handleUpdateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
        if (!selectedProject) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (!res.ok) throw new Error('Fehler');

            setSelectedProject(prev => prev ? {
                ...prev,
                trades: prev.trades.map(trade => ({
                    ...trade,
                    tasks: trade.tasks.map(task =>
                        task.id === taskId
                            ? { ...task, status: newStatus, updatedAt: new Date() }
                            : task
                    ),
                })),
            } : null);
        } catch {
            console.error('Failed to update task status');
        }
    };

    const handleTogglePhotoVisibility = (photoId: string) => {
        if (!selectedProject) return;
        setSelectedProject(prev => prev ? {
            ...prev,
            trades: prev.trades.map(trade => ({
                ...trade,
                tasks: trade.tasks.map(task => ({
                    ...task,
                    photos: task.photos.map(photo =>
                        photo.id === photoId
                            ? { ...photo, visibility: photo.visibility === 'client' ? 'internal' : 'client' }
                            : photo
                    ),
                })),
            })),
        } : null);
    };

    const handleReportProblem = async (taskId: string, reason: string) => {
        if (!selectedProject) return;
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'blocked', blockedReason: reason }),
            });
            if (!res.ok) throw new Error('Fehler');

            setSelectedProject(prev => prev ? {
                ...prev,
                trades: prev.trades.map(trade => ({
                    ...trade,
                    tasks: trade.tasks.map(task =>
                        task.id === taskId
                            ? { ...task, status: 'blocked' as TaskStatus, blockedReason: reason, updatedAt: new Date() }
                            : task
                    ),
                })),
            } : null);
        } catch {
            console.error('Failed to report problem');
        }
    };

    if (showProjectList && projects.length > 1) {
        return (
            <AppShell currentPage="dashboard">
                <div className="max-w-4xl mx-auto p-4">
                    <ProjectList
                        projects={projects}
                        onSelectProject={(p) => {
                            setSelectedProject(p);
                            setSelectedProjectId(p.id);
                            setShowProjectList(false);
                        }}
                    />
                </div>
            </AppShell>
        );
    }

    const project = selectedProject || projects[0];
    if (!project) {
        return (
            <AppShell currentPage="dashboard">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /></svg></div>
                    <p className="text-muted-foreground">Keine Projekte verfügbar</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell currentPage="dashboard">
            {projects.length > 1 && !showProjectList && (
                <div className="max-w-4xl mx-auto px-4 pt-4">
                    <button
                        onClick={() => setShowProjectList(true)}
                        className="text-sm text-accent hover:text-accent-light flex items-center gap-1 tap-active"
                    >
                        ← Alle Projekte
                    </button>
                </div>
            )}

            {role === 'client' && <ClientDashboard project={project} />}

            {role === 'architect' && (
                <ArchitectDashboard
                    project={project}
                    userName={user.name ?? undefined}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onTogglePhotoVisibility={handleTogglePhotoVisibility}
                />
            )}

            {role === 'contractor' && (
                <ContractorDashboard
                    project={project}
                    contractorId={user.id}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onReportProblem={handleReportProblem}
                />
            )}
        </AppShell>
    );
}

export default function DashboardPage() {
    return (
        <ToastProvider>
            <DashboardContent />
        </ToastProvider>
    );
}
