'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TaskDetailModal } from '@/components/modals/TaskDetailModal';
import { SwipeableSheet } from '@/components/ui/SwipeableSheet';
import { InputField } from '@/components/ui/InputField';
import { Project, Task, TaskStatus, Trade, Role } from '@/types';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useProjectContext } from '@/lib/ProjectContext';
import { useRealtimeSubscription } from '@/lib/realtime';

function TasksPageContent() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();
    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
    const [selectedTask, setSelectedTask] = useState<(Task & { tradeName: string }) | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateTask, setShowCreateTask] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newTask, setNewTask] = useState({ tradeId: '', name: '', description: '', dueDate: '' });

    const role = session?.user?.role as Role | undefined;

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
                showToast('Fehler beim Laden der Projekte', 'error');
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [status, selectedProjectId, setSelectedProjectId, showToast]);

    const project = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

    // Real-time task updates
    useRealtimeSubscription({
        table: 'tasks',
        event: '*',
        onEvent: () => {
            // Refetch projects on any task change
            fetch('/api/projects')
                .then(res => res.ok ? res.json() : null)
                .then(data => { if (data) setProjects(data); })
                .catch(() => {});
            showToast('Aufgaben aktualisiert', 'info');
        },
        enabled: status === 'authenticated',
    });

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
                    <p className="text-foreground font-medium mb-1">Nur für Bauleitung & Handwerker</p>
                    <p className="text-sm text-muted-foreground mb-4">Aufgaben sind für Kunden nicht sichtbar.</p>
                    <a href="/dashboard" className="text-sm text-accent font-medium hover:underline">Zum Dashboard</a>
                </div>
            </AppShell>
        );
    }

    if (!project) {
        return (
            <AppShell currentPage="tasks">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg></div>
                    <p className="text-foreground font-medium mb-1">Kein Projekt vorhanden</p>
                    <p className="text-sm text-muted-foreground mb-4">Erstellen Sie zuerst ein Projekt in der Verwaltung.</p>
                    {role === 'architect' && <a href="/admin" className="text-sm text-accent font-medium hover:underline">Zur Verwaltung</a>}
                </div>
            </AppShell>
        );
    }

    // Gather tasks (contractors only see tasks from their assigned trades)
    const allTasks: (Task & { tradeName: string; tradeId: string })[] = [];
    project.trades.forEach(trade => {
        if (role === 'contractor' && trade.contractorId !== session.user.id) {
            return;
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

    const refetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (res.ok) {
                const data: Project[] = await res.json();
                setProjects(data);
            }
        } catch { /* ignore */ }
    };

    const handleAddComment = async (content: string, visibility: 'internal' | 'client') => {
        if (!selectedTask) return;
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ taskId: selectedTask.id, content, visibility }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Fehler beim Erstellen');
            }
            showToast('Kommentar hinzugefügt', 'success');
            // Refetch and update selectedTask from fresh data
            const refetchRes = await fetch('/api/projects');
            if (refetchRes.ok) {
                const freshProjects: Project[] = await refetchRes.json();
                setProjects(freshProjects);
                // Find updated task in fresh data
                const freshProject = freshProjects.find(p => p.id === project?.id);
                if (freshProject) {
                    for (const trade of freshProject.trades) {
                        const updatedTask = trade.tasks.find(t => t.id === selectedTask.id);
                        if (updatedTask) {
                            setSelectedTask({ ...updatedTask, tradeName: trade.name, tradeId: trade.id });
                            break;
                        }
                    }
                }
            }
        } catch (error: any) {
            showToast(error.message || 'Fehler beim Kommentieren', 'error');
        }
    };

    const handlePhotoUploaded = async () => {
        showToast('Foto hochgeladen', 'success');
        await refetchProjects();
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

            setProjects(prev => prev.map(proj => proj.id !== project.id ? proj : {
                ...proj,
                trades: proj.trades.map(trade => ({
                    ...trade,
                    tasks: trade.tasks.map(task =>
                        task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date() } : task
                    ),
                })),
            }));
            showToast('Status aktualisiert', 'success');
            setSelectedTask(null);
        } catch (error: any) {
            showToast(error.message || 'Fehler beim Aktualisieren', 'error');
        }
    };

    // Trades available for task creation
    const availableTrades: Trade[] = project.trades.filter(trade => {
        if (role === 'architect') return true;
        if (role === 'contractor') return trade.contractorId === session.user.id && trade.canCreateSubtasks;
        return false;
    });

    const canCreateTasks = availableTrades.length > 0;

    const handleCreateTask = async () => {
        if (!newTask.name.trim() || !newTask.tradeId) {
            showToast('Name und Gewerk sind erforderlich', 'error');
            return;
        }
        setCreating(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tradeId: newTask.tradeId,
                    name: newTask.name,
                    description: newTask.description || undefined,
                    dueDate: newTask.dueDate || undefined,
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Fehler beim Erstellen');
            }
            showToast('Aufgabe erstellt', 'success');
            setShowCreateTask(false);
            setNewTask({ tradeId: '', name: '', description: '', dueDate: '' });
            await refetchProjects();
        } catch (error: any) {
            showToast(error.message || 'Fehler beim Erstellen', 'error');
        }
        setCreating(false);
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
                            <p className="text-foreground font-medium mb-1">{filter === 'all' ? 'Noch keine Aufgaben' : 'Keine Aufgaben in diesem Filter'}</p>
                            <p className="text-sm text-muted-foreground">{filter === 'all' ? 'Aufgaben werden über die Gewerke-Verwaltung erstellt.' : 'Wählen Sie einen anderen Filter oder erstellen Sie neue Aufgaben.'}</p>
                            {filter !== 'all' && <button onClick={() => setFilter('all')} className="text-sm text-accent font-medium hover:underline mt-3">Alle anzeigen</button>}
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

                {/* FAB - Create Task */}
                {canCreateTasks && (
                    <button
                        onClick={() => {
                            if (availableTrades.length === 1) {
                                setNewTask(prev => ({ ...prev, tradeId: availableTrades[0].id }));
                            }
                            setShowCreateTask(true);
                        }}
                        className="fixed bottom-24 right-4 z-20 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg flex items-center justify-center tap-active hover:opacity-90 transition-opacity"
                        aria-label="Neue Aufgabe"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    </button>
                )}

                {/* Create Task Sheet */}
                <SwipeableSheet
                    isOpen={showCreateTask}
                    onClose={() => setShowCreateTask(false)}
                    title="Neue Aufgabe"
                    footer={
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreateTask(false)} className="flex-1 btn-mobile btn-mobile-secondary tap-active">
                                Abbrechen
                            </button>
                            <button onClick={handleCreateTask} disabled={creating} className="flex-1 btn-mobile btn-mobile-accent tap-active disabled:opacity-50">
                                {creating ? 'Erstellen...' : 'Aufgabe erstellen'}
                            </button>
                        </div>
                    }
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">Gewerk *</label>
                            <select
                                value={newTask.tradeId}
                                onChange={e => setNewTask({ ...newTask, tradeId: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:border-accent outline-none text-base"
                            >
                                <option value="">— Gewerk wählen —</option>
                                {availableTrades.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <InputField
                            label="Aufgabe *"
                            value={newTask.name}
                            onChange={v => setNewTask({ ...newTask, name: v })}
                            placeholder="z.B. Steckdosen setzen"
                        />
                        <InputField
                            label="Beschreibung"
                            value={newTask.description}
                            onChange={v => setNewTask({ ...newTask, description: v })}
                            placeholder="Optionale Details..."
                        />
                        <InputField
                            label="Fällig am"
                            type="date"
                            value={newTask.dueDate}
                            onChange={v => setNewTask({ ...newTask, dueDate: v })}
                        />
                    </div>
                </SwipeableSheet>

                {/* Task Detail Modal */}
                {selectedTask && (
                    <TaskDetailModal
                        task={selectedTask}
                        isOpen={true}
                        onClose={() => setSelectedTask(null)}
                        onUpdateStatus={(status) => handleUpdateStatus(selectedTask.id, status)}
                        onAddComment={handleAddComment}
                        onPhotoUploaded={handlePhotoUploaded}
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
