'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ClientDashboard } from '@/components/views/ClientDashboard';
import { ArchitectDashboard } from '@/components/views/ArchitectDashboard';
import { ContractorDashboard } from '@/components/views/ContractorDashboard';
import { Card, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { Project, TaskStatus, Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';
import { BauLotIcon } from '@/components/ui/Logo';
import { calculateProjectProgress, formatDate, getDaysUntil } from '@/lib/utils';
import { useProjectContext } from '@/lib/ProjectContext';

// ─── Week calendar helper ────────────────────────────────
function getWeekDays(): { label: string; date: Date; isToday: boolean }[] {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    monday.setHours(0, 0, 0, 0);

    const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const days: { label: string; date: Date; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push({
            label: labels[i],
            date: d,
            isToday: d.toDateString() === now.toDateString(),
        });
    }
    return days;
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 11) return 'Guten Morgen';
    if (hour < 17) return 'Guten Tag';
    return 'Guten Abend';
}

function getGermanDateString(): string {
    return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());
}

// ─── Main Dashboard Content ──────────────────────────────
function DashboardContent() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();

    const user = session?.user;
    const role = user?.role as Role | undefined;

    useEffect(() => {
        if (status === 'authenticated') {
            fetchProjects();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

                if (!selectedProjectId && accessibleProjects.length > 0) {
                    setSelectedProjectId(accessibleProjects[0].id);
                }

                // Client with 1 project → go straight to project view
                if (role === 'client' && accessibleProjects.length === 1) {
                    setSelectedProject(accessibleProjects[0]);
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
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse text-accent-foreground">
                        <BauLotIcon size={28} />
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
        const proj = selectedProject;
        if (!proj) return;
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

    // ─── Project Detail View ────────────────────────────
    if (selectedProject) {
        return (
            <AppShell currentPage="dashboard">
                {/* Back to overview */}
                <div className="max-w-7xl mx-auto px-4 pt-4 md:px-8">
                    <button
                        onClick={() => setSelectedProject(null)}
                        className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors"
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        Alle Projekte
                    </button>
                </div>

                {role === 'client' && <ClientDashboard project={selectedProject} />}
                {role === 'architect' && (
                    <ArchitectDashboard
                        project={selectedProject}
                        userName={user.name ?? undefined}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                        onTogglePhotoVisibility={handleTogglePhotoVisibility}
                    />
                )}
                {role === 'contractor' && (
                    <ContractorDashboard
                        project={selectedProject}
                        contractorId={user.id}
                        onUpdateTaskStatus={handleUpdateTaskStatus}
                        onReportProblem={handleReportProblem}
                    />
                )}
            </AppShell>
        );
    }

    // ─── Projects Overview (Main Dashboard) ─────────────
    const noProjects = projects.length === 0;
    if (noProjects) {
        return (
            <AppShell currentPage="dashboard">
                <div className="max-w-md mx-auto p-4 text-center py-20">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="text-muted-foreground" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">Willkommen bei BauLot</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        {role === 'architect'
                            ? 'Erstellen Sie Ihr erstes Bauprojekt, um loszulegen.'
                            : 'Ihnen wurden noch keine Projekte zugewiesen. Kontaktieren Sie Ihre Bauleitung.'}
                    </p>
                    {role === 'architect' && (
                        <a href="/admin" className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground rounded-xl font-medium text-sm hover:bg-accent/90 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                            Erstes Projekt anlegen
                        </a>
                    )}
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell currentPage="dashboard">
            <ProjectsOverview
                projects={projects}
                userName={user.name ?? undefined}
                role={role!}
                onSelectProject={(p) => {
                    setSelectedProject(p);
                    setSelectedProjectId(p.id);
                }}
            />
        </AppShell>
    );
}

// ─── Projects Overview Component ─────────────────────────
function ProjectsOverview({
    projects,
    userName,
    role,
    onSelectProject,
}: {
    projects: Project[];
    userName?: string;
    role: Role;
    onSelectProject: (p: Project) => void;
}) {
    const router = useRouter();
    const weekDays = useMemo(() => getWeekDays(), []);
    const displayName = userName?.split(' ')[0] || 'Bauleiter';

    // Aggregate stats across all projects
    const stats = useMemo(() => {
        let totalTasks = 0;
        let doneTasks = 0;
        let activeTrades = 0;
        let blockedTasks = 0;

        projects.forEach(p => {
            p.trades.forEach(t => {
                if (t.tasks.some(task => task.status === 'in_progress')) activeTrades++;
                t.tasks.forEach(task => {
                    totalTasks++;
                    if (task.status === 'done') doneTasks++;
                    if (task.status === 'blocked') blockedTasks++;
                });
            });
        });

        return { totalTasks, doneTasks, activeTrades, blockedTasks };
    }, [projects]);

    // Upcoming deadlines across all projects
    const upcomingDeadlines = useMemo(() => {
        const now = new Date();
        const deadlines: { tradeName: string; projectName: string; endDate: Date; order: number }[] = [];
        projects.forEach(p => {
            p.trades.forEach(t => {
                if (t.endDate && new Date(t.endDate) >= now) {
                    deadlines.push({
                        tradeName: t.name,
                        projectName: p.name,
                        endDate: new Date(t.endDate),
                        order: t.order,
                    });
                }
            });
        });
        deadlines.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
        return deadlines.slice(0, 6);
    }, [projects]);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Greeting Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{getGermanDateString()}</p>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mt-1">
                            {getGreeting()}, {displayName}!
                        </h1>
                    </div>
                    {role === 'architect' && (
                        <Button variant="primary" size="sm" onClick={() => router.push('/admin/projects/new')} icon={
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        }>Neues Projekt</Button>
                    )}
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 py-4">
                            <div className="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center shrink-0">
                                <svg className="text-success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{stats.doneTasks}</p>
                                <p className="text-xs text-muted-foreground truncate">Erledigt</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 py-4">
                            <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center shrink-0">
                                <svg className="text-info" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{stats.activeTrades}</p>
                                <p className="text-xs text-muted-foreground truncate">Gewerke aktiv</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 py-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stats.blockedTasks > 0 ? 'bg-warning-muted' : 'bg-muted'}`}>
                                <svg className={stats.blockedTasks > 0 ? 'text-warning' : 'text-muted-foreground'} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{stats.blockedTasks}</p>
                                <p className="text-xs text-muted-foreground truncate">Blockiert</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Projects Grid */}
                <div>
                    <h2 className="font-semibold text-foreground mb-3">Projekte</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {projects.map(project => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                onClick={() => onSelectProject(project)}
                            />
                        ))}
                    </div>
                </div>

                {/* Bottom Grid: Calendar + Deadlines */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                    {/* Week Calendar + Deadlines */}
                    <Card>
                        <div className="px-4 py-3 border-b border-border/60">
                            <h2 className="font-semibold text-foreground">Zeitplan</h2>
                        </div>
                        <CardContent className="space-y-4">
                            {/* Week Strip */}
                            <div className="flex justify-between gap-1">
                                {weekDays.map((day) => (
                                    <div key={day.label} className="flex flex-col items-center gap-1 flex-1">
                                        <span className="text-[11px] text-muted-foreground font-medium">{day.label}</span>
                                        <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                            day.isToday
                                                ? 'bg-foreground text-background'
                                                : 'text-foreground hover:bg-muted'
                                        }`}>
                                            {day.date.getDate()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Upcoming Deadlines */}
                            <div className="space-y-2 pt-2">
                                {upcomingDeadlines.length === 0 && (
                                    <p className="text-sm text-muted-foreground py-2">Keine anstehenden Termine</p>
                                )}
                                {upcomingDeadlines.map((d, idx) => (
                                    <div key={idx} className="flex items-center gap-3 py-1.5">
                                        <span className="w-2 h-2 rounded-full bg-foreground/30 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground truncate">{d.tradeName}</p>
                                            <p className="text-xs text-muted-foreground truncate">{d.projectName}</p>
                                        </div>
                                        <span className="text-xs text-muted-foreground whitespace-nowrap">bis {formatDate(d.endDate)}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Recent Activity across all projects */}
                    <Card>
                        <div className="px-4 py-3 border-b border-border/60">
                            <h2 className="font-semibold text-foreground">Letzte Aktivit&auml;t</h2>
                        </div>
                        <CardContent>
                            <RecentActivity projects={projects} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ─── Project Card ────────────────────────────────────────
function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
    const progress = calculateProjectProgress(project);
    const daysRemaining = getDaysUntil(project.targetEndDate);
    const totalTasks = project.trades.reduce((sum, t) => sum + t.tasks.length, 0);

    return (
        <Card hover onClick={onClick} className="cursor-pointer">
            <CardContent className="py-4 space-y-3">
                <div className="flex items-start justify-between">
                    <div className="min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{project.name}</h3>
                        <p className="text-sm text-muted-foreground truncate">{project.address}</p>
                    </div>
                    <span className="text-lg font-bold text-foreground tabular-nums ml-3">{progress.totalPercentage}%</span>
                </div>

                <ProgressBar percentage={progress.totalPercentage} size="sm" showLabel={false} />

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <span>{totalTasks} Aufgaben</span>
                        {progress.blockedCount > 0 && (
                            <span className="text-warning font-medium">{progress.blockedCount} blockiert</span>
                        )}
                    </div>
                    <span>
                        {daysRemaining > 0 ? `${daysRemaining}d verbleibend` :
                         daysRemaining === 0 ? 'Fällig heute' :
                         `${Math.abs(daysRemaining)}d überfällig`}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Recent Activity ────────────────────────────────────
function RecentActivity({ projects }: { projects: Project[] }) {
    const items = useMemo(() => {
        const list: { id: string; type: 'done' | 'blocked' | 'in_progress'; title: string; subtitle: string; time: Date }[] = [];
        projects.forEach(p => {
            p.trades.forEach(t => {
                t.tasks.forEach(task => {
                    if (task.status === 'done') {
                        list.push({ id: `d-${task.id}`, type: 'done', title: `${task.title} erledigt`, subtitle: `${t.name} — ${p.name}`, time: task.updatedAt });
                    } else if (task.status === 'blocked') {
                        list.push({ id: `b-${task.id}`, type: 'blocked', title: `Problem: ${task.title}`, subtitle: `${t.name} — ${p.name}`, time: task.updatedAt });
                    } else if (task.status === 'in_progress') {
                        list.push({ id: `i-${task.id}`, type: 'in_progress', title: `${task.title} gestartet`, subtitle: `${t.name} — ${p.name}`, time: task.updatedAt });
                    }
                });
            });
        });
        list.sort((a, b) => b.time.getTime() - a.time.getTime());
        return list.slice(0, 5);
    }, [projects]);

    if (items.length === 0) {
        return <p className="text-sm text-muted-foreground py-4 text-center">Noch keine Aktivit&auml;ten</p>;
    }

    const iconMap = {
        done: { bg: 'bg-success-muted', color: 'text-success', path: <polyline points="20 6 9 17 4 12" /> },
        blocked: { bg: 'bg-warning-muted', color: 'text-warning', path: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></> },
        in_progress: { bg: 'bg-info-muted', color: 'text-info', path: <polyline points="9 18 15 12 9 6" /> },
    };

    return (
        <div className="space-y-0">
            {items.map(item => {
                const icon = iconMap[item.type];
                return (
                    <div key={item.id} className="flex gap-3 py-3 border-b border-border/30 last:border-0">
                        <div className="mt-0.5 shrink-0">
                            <div className={`w-7 h-7 rounded-full ${icon.bg} flex items-center justify-center`}>
                                <svg className={icon.color} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    {icon.path}
                                </svg>
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function DashboardPage() {
    return (
        <ToastProvider>
            <DashboardContent />
        </ToastProvider>
    );
}
