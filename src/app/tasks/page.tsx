'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { TaskDetailModal } from '@/components/modals/TaskDetailModal';
import { demoProjects } from '@/lib/demo-data';
import { Task, TaskStatus, Role } from '@/types';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function TasksPageContent() {
    const { data: session, status } = useSession();
    const { showToast } = useToast();
    const [filter, setFilter] = useState<TaskStatus | 'all'>('all');
    const [selectedTask, setSelectedTask] = useState<(Task & { tradeName: string }) | null>(null);
    const [project, setProject] = useState(demoProjects[0]);

    const role = session?.user?.role as Role | undefined;

    if (status === 'loading' || !session) {
        return null;
    }

    // Clients shouldn't see tasks page - middleware handles redirect
    if (role === 'client') {
        return (
            <AppShell currentPage="tasks">
                <div className="max-w-4xl mx-auto p-4 text-center py-16">
                    <span className="text-6xl block mb-4">🔒</span>
                    <p className="text-gray-500">Diese Seite ist für Kunden nicht verfügbar.</p>
                </div>
            </AppShell>
        );
    }

    // Gather tasks based on role
    const allTasks: (Task & { tradeName: string; tradeId: string })[] = [];
    project.trades.forEach(trade => {
        // Contractors only see their assigned trades
        if (role === 'contractor' && session.user.assignedTradeIds) {
            if (!session.user.assignedTradeIds.includes(trade.id)) return;
        }
        trade.tasks.forEach(task => {
            allTasks.push({ ...task, tradeName: trade.name, tradeId: trade.id });
        });
    });

    // Filter tasks
    const filteredTasks = filter === 'all'
        ? allTasks
        : allTasks.filter(t => t.status === filter);

    // Stats
    const stats = {
        all: allTasks.length,
        open: allTasks.filter(t => t.status === 'open').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        done: allTasks.filter(t => t.status === 'done').length,
        blocked: allTasks.filter(t => t.status === 'blocked').length,
    };

    const handleUpdateStatus = (taskId: string, newStatus: TaskStatus) => {
        setProject(prev => ({
            ...prev,
            trades: prev.trades.map(trade => ({
                ...trade,
                tasks: trade.tasks.map(task =>
                    task.id === taskId
                        ? { ...task, status: newStatus, updatedAt: new Date() }
                        : task
                ),
            })),
        }));
        showToast('Status aktualisiert', 'success');
        setSelectedTask(null);
    };

    return (
        <AppShell currentPage="tasks">
            <div className="max-w-4xl mx-auto p-4">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Aufgaben</h1>
                    <p className="text-gray-500">{project.name}</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                    {(['all', 'open', 'in_progress', 'done', 'blocked'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${filter === f
                                    ? f === 'blocked'
                                        ? 'bg-orange-100 text-orange-700'
                                        : f === 'done'
                                            ? 'bg-green-100 text-green-700'
                                            : f === 'in_progress'
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-800 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'all' ? `Alle (${stats.all})` :
                                f === 'open' ? `Offen (${stats.open})` :
                                    f === 'in_progress' ? `In Arbeit (${stats.in_progress})` :
                                        f === 'done' ? `Erledigt (${stats.done})` :
                                            `Blockiert (${stats.blocked})`}
                        </button>
                    ))}
                </div>

                {/* Task List */}
                {filteredTasks.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <span className="text-6xl block mb-4">📋</span>
                            <p className="text-gray-500">Keine Aufgaben in diesem Filter</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {filteredTasks.map((task) => (
                            <Card
                                key={task.id}
                                hover
                                onClick={() => setSelectedTask(task)}
                                className="cursor-pointer"
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <StatusBadge status={task.status} />
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-gray-900 truncate">{task.title}</p>
                                                <p className="text-sm text-gray-500">{task.tradeName}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            {task.photos.length > 0 && (
                                                <span className="text-xs text-gray-400">📷 {task.photos.length}</span>
                                            )}
                                            {task.comments.length > 0 && (
                                                <span className="text-xs text-gray-400">💬 {task.comments.length}</span>
                                            )}
                                            <span className="text-gray-300">›</span>
                                        </div>
                                    </div>
                                    {task.blockedReason && (
                                        <p className="mt-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-lg inline-block">
                                            ⚠ {task.blockedReason}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

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
