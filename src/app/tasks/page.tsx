'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TaskDetailModal } from '@/components/modals/TaskDetailModal';
import { Project, Task, TaskStatus, Role } from '@/types';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function TasksPageContent() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
    const [selectedTask, setSelectedTask] = useState<(Task & { tradeName: string }) | null>(null);
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);

    const role = session?.user?.role as Role | undefined;

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
                showToast('Fehler beim Laden der Projekte', 'error');
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [status]);

    if (status === 'loading' || !session || loading) {
        return (
            <AppShell currentPage="tasks">
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-muted-foreground">Laden...</div>
                </div>
            </AppShell>
        );
    }

    if (role === 'client') {
        return (
            <AppShell currentPage="tasks">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg></div>
                    <p className="text-muted-foreground">Diese Seite ist für Kunden nicht verfügbar.</p>
                </div>
            </AppShell>
        );
    }

    if (!project) {
        return (
            <AppShell currentPage="tasks">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                    <p className="text-muted-foreground">Kein Projekt verfügbar</p>
                </div>
            </AppShell>
        );
    }

    // Gather tasks
    const allTasks: (Task & { tradeName: string; tradeId: string })[] = [];
    project.trades.forEach(trade => {
        if (role === 'contractor' && session.user.assignedTradeIds) {
            if (!session.user.assignedTradeIds.includes(trade.id)) return;
        }
        trade.tasks.forEach(task => {
            allTasks.push({ ...task, tradeName: trade.name, tradeId: trade.id });
        });
    });

    const filteredTasks = filter === 'all' ? allTasks : allTasks.filter(t => t.status === filter);

    const stats = {
        all: allTasks.length,
        pending: allTasks.filter(t => t.status === 'pending').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        done: allTasks.filter(t => t.status === 'done').length,
        blocked: allTasks.filter(t => t.status === 'blocked').length,
    };

    const handleUpdateStatus = async (taskId: string, newStatus: TaskStatus) => {
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Fehler beim Aktualisieren');
            }

            setProject(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    trades: prev.trades.map(trade => ({
                        ...trade,
                        tasks: trade.tasks.map(task =>
                            task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date() } : task
                        ),
                    })),
                };
            });
            showToast('Status aktualisiert', 'success');
            setSelectedTask(null);
        } catch (error: any) {
            showToast(error.message || 'Fehler beim Aktualisieren', 'error');
        }
    };

    const filterConfig = [
        { id: 'all', label: 'Alle', count: stats.all, color: 'bg-primary text-primary-foreground' },
        { id: 'pending', label: 'Offen', count: stats.pending, color: 'bg-muted text-foreground' },
        { id: 'in_progress', label: 'In Arbeit', count: stats.in_progress, color: 'bg-blue-500/10 text-blue-500' },
        { id: 'done', label: 'Erledigt', count: stats.done, color: 'bg-green-500/10 text-green-500' },
        { id: 'blocked', label: 'Blockiert', count: stats.blocked, color: 'bg-orange-500/10 text-orange-500' },
    ];

    return (
        <AppShell currentPage="tasks">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
                    <h1 className="text-headline text-foreground">Aufgaben</h1>
                    <p className="text-sm text-muted-foreground">{project.name}</p>
                </header>

                {/* Filter Tabs - Horizontal Scroll */}
                <div className="sticky top-[73px] z-20 bg-background border-b border-border">
                    <div className="flex gap-2 px-4 py-3 overflow-x-auto no-scrollbar">
                        {filterConfig.map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as any)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
                                    whitespace-nowrap flex-shrink-0 tap-active transition-all
                                    ${filter === f.id ? f.color : 'bg-muted text-muted-foreground'}
                                `}
                            >
                                <span>{f.label}</span>
                                <span className={`
                                    text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full px-1.5
                                    ${filter === f.id ? 'bg-surface/20' : 'bg-border'}
                                `}>
                                    {f.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Task List */}
                <div className="p-4 space-y-3">
                    {filteredTasks.length === 0 ? (
                        <div className="card-mobile text-center py-12">
                            <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3"><svg className="text-muted-foreground" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                            <p className="text-muted-foreground">Keine Aufgaben in diesem Filter</p>
                        </div>
                    ) : (
                        filteredTasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => setSelectedTask(task)}
                                className="card-mobile tap-active"
                            >
                                <div className="flex items-center gap-3">
                                    <StatusBadge status={task.status} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground truncate">{task.title}</p>
                                        <p className="text-sm text-muted-foreground">{task.tradeName}</p>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {task.photos.length > 0 && (
                                            <span className="text-xs text-muted-foreground inline-flex items-center gap-0.5"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>{task.photos.length}</span>
                                        )}
                                        <span className="text-muted-foreground">›</span>
                                    </div>
                                </div>
                                {task.blockedReason && (
                                    <p className="mt-2 text-sm text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-lg">
                                        <svg className="inline mr-1" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>{task.blockedReason}
                                    </p>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {/* Task Detail Modal */}
                {selectedTask && (
                    <TaskDetailModal
                        task={selectedTask}
                        isOpen={true}
                        onClose={() => setSelectedTask(null)}
                        onUpdateStatus={(status) => handleUpdateStatus(selectedTask.id, status)}
                        role={role!}
                    />
                )}
            </div>
        </AppShell>
    );
}

export default function TasksPage() {
    return (
        <ToastProvider>
            <TasksPageContent />
        </ToastProvider>
    );
}
