'use client';

import { useState } from 'react';
import { Project, Trade, Task, TaskStatus } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';

interface ContractorDashboardProps {
    project: Project;
    contractorId: string;
    onUpdateTaskStatus?: (taskId: string, status: TaskStatus) => void;
    onAddPhoto?: (taskId: string) => void;
    onAddComment?: (taskId: string, content: string) => void;
    onReportProblem?: (taskId: string, reason: string) => void;
}

export function ContractorDashboard({
    project,
    contractorId,
    onUpdateTaskStatus,
    onAddPhoto,
    onReportProblem,
}: ContractorDashboardProps) {
    const [showProblemSheet, setShowProblemSheet] = useState(false);
    const [problemReason, setProblemReason] = useState('');
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

    // Find trades assigned to this contractor
    const myTrades = project.trades.filter(t => t.contractorId === contractorId);
    const myTasks = myTrades.flatMap(trade =>
        trade.tasks.map(task => ({ ...task, tradeName: trade.name }))
    );

    const currentTask = myTasks.find(t => t.status !== 'done') || myTasks[0];
    const upcomingTasks = myTasks.filter(t => t.id !== currentTask?.id && t.status !== 'done');

    const handleAction = (action: 'start' | 'done') => {
        if (!currentTask) return;
        const newStatus = action === 'start' ? 'in_progress' : 'done';
        onUpdateTaskStatus?.(currentTask.id, newStatus);
    };

    const handleReportProblem = () => {
        if (activeTaskId && problemReason.trim()) {
            onReportProblem?.(activeTaskId, problemReason);
            setShowProblemSheet(false);
            setProblemReason('');
            setActiveTaskId(null);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground safe-area-top">
            {/* === HEADER === */}
            <header className="px-5 pt-6 pb-4">
                <p className="text-caption text-muted-foreground mb-1">MEIN BAUPROJEKT</p>
                <h1 className="text-headline text-foreground">{project.name}</h1>
            </header>

            {/* === MAIN CONTENT === */}
            <main className="px-4 pb-32 space-y-6 animate-fade-in">
                {/* Hero Card: Current Task */}
                {currentTask && (
                    <section className="card-mobile animate-scale-in">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-title">Aktuelle Aufgabe</h2>
                            <StatusBadge status={currentTask.status} size="sm" />
                        </div>

                        {/* Task Info */}
                        <div className="p-4 bg-muted rounded-xl border-l-4 border-accent mb-6">
                            <p className="font-bold text-lg text-foreground">{currentTask.title}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {currentTask.tradeName} • {currentTask.dueDate ? formatDate(currentTask.dueDate) : 'Flexibel'}
                            </p>
                        </div>

                        {/* Large Action Buttons (Touch-first) */}
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => handleAction('start')}
                                className="btn-mobile btn-mobile-lg bg-primary text-primary-foreground tap-active-strong flex flex-col items-center gap-2"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="10" width="22" height="7" rx="1.5" /><path d="M5 10V6a2 2 0 0 1 2-2h5l3 4" /><circle cx="7" cy="19" r="2" /><circle cx="17" cy="19" r="2" /></svg>
                                <span>In Anfahrt</span>
                            </button>
                            <button
                                onClick={() => handleAction('done')}
                                className="btn-mobile btn-mobile-lg bg-success text-white tap-active-strong flex flex-col items-center gap-2"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                                <span>Erledigt</span>
                            </button>
                        </div>

                        {/* Secondary Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                onClick={() => onAddPhoto?.(currentTask.id)}
                                className="btn-mobile btn-mobile-secondary tap-active"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                Foto
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTaskId(currentTask.id);
                                    setShowProblemSheet(true);
                                }}
                                className="btn-mobile bg-error text-white tap-active"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                                Problem
                            </button>
                        </div>
                    </section>
                )}

                {/* Upcoming Tasks */}
                {upcomingTasks.length > 0 && (
                    <section>
                        <h3 className="text-caption text-muted-foreground mb-3 px-1">DEMNÄCHST</h3>
                        <div className="space-y-3">
                            {upcomingTasks.map((task, index) => (
                                <div
                                    key={task.id}
                                    className="card-mobile card-mobile-interactive bg-muted/50 text-foreground flex items-center justify-between tap-active"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{task.title}</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {task.dueDate ? formatDate(task.dueDate) : 'Kein Datum'}
                                        </p>
                                    </div>
                                    <StatusBadge status={task.status} size="sm" />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Empty State */}
                {myTasks.length === 0 && (
                    <section className="card-mobile text-center py-12 animate-fade-in">
                        <div className="w-14 h-14 bg-success-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="text-success" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                        </div>
                        <p className="text-lg font-medium text-foreground">Keine offenen Aufgaben</p>
                        <p className="text-muted-foreground mt-1">Du hast alles erledigt!</p>
                    </section>
                )}
            </main>

            {/* === BOTTOM SHEET: Problem Report === */}
            {showProblemSheet && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 animate-fade-in"
                        onClick={() => setShowProblemSheet(false)}
                    />
                    {/* Sheet */}
                    <div className="bottom-sheet z-50 p-6 animate-slide-up safe-area-bottom">
                        <div className="bottom-sheet-handle" />

                        <h3 className="text-headline text-foreground mb-4">Problem melden</h3>

                        <textarea
                            value={problemReason}
                            onChange={(e) => setProblemReason(e.target.value)}
                            placeholder="Beschreibe das Problem..."
                            className="w-full p-4 bg-muted rounded-xl text-foreground resize-none h-32 focus:outline-none focus:ring-2 focus:ring-accent"
                            autoFocus
                        />

                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                                onClick={() => setShowProblemSheet(false)}
                                className="btn-mobile btn-mobile-secondary tap-active"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={handleReportProblem}
                                disabled={!problemReason.trim()}
                                className="btn-mobile bg-error text-white tap-active disabled:opacity-50"
                            >
                                Melden
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
