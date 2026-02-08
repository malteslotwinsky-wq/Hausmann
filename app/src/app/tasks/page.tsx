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
                    <span className="text-6xl block mb-4">🔒</span>
                    <p className="text-muted-foreground">Diese Seite ist für Kunden nicht verfügbar.</p>
                </div>
            </AppShell>
        );
    }

    if (!project) {
        return (
            <AppShell currentPage="tasks">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <span className="text-6xl block mb-4">📋</span>
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
        open: allTasks.filter(t => t.status === 'open').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        done: allTasks.filter(t => t.status === 'done').length,
        blocked: allTasks.filter(t => t.status === 'blocked').length,
    };

    const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
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
    };

    const filterConfig = [
        { id: 'all', label: 'Alle', count: stats.all, color: 'bg-primary text-primary-foreground' },
        { id: 'open', label: 'Offen', count: stats.open, color: 'bg-muted text-foreground' },
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
                                    ${filter === f.id ? 'bg-white/20' : 'bg-border'}
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
                            <span className="text-5xl block mb-3">📋</span>
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
                                            <span className="text-xs text-muted-foreground">📷 {task.photos.length}</span>
                                        )}
                                        <span className="text-muted-foreground">›</span>
                                    </div>
                                </div>
                                {task.blockedReason && (
                                    <p className="mt-2 text-sm text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-lg">
                                        ⚠ {task.blockedReason}
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
