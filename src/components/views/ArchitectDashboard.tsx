'use client';

import { useState } from 'react';
import { Project, Trade, Task, TaskStatus } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { CalendarIconButton } from '@/components/ui/CalendarExport';
import { createProjectEvent, createTradeEvent } from '@/lib/calendar';
import { calculateProjectProgress, formatDate, getDaysUntil } from '@/lib/utils';
import { exportProjectReport } from '@/lib/pdf-export';

interface ArchitectDashboardProps {
    project: Project;
    onUpdateTaskStatus?: (taskId: string, status: TaskStatus) => void;
    onTogglePhotoVisibility?: (photoId: string) => void;
}

export function ArchitectDashboard({ project, onUpdateTaskStatus, onTogglePhotoVisibility }: ArchitectDashboardProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'photos'>('overview');
    const [expandedTrade, setExpandedTrade] = useState<string | null>(project.trades[0]?.id);
    const progress = calculateProjectProgress(project);
    const daysRemaining = getDaysUntil(project.targetEndDate);

    return (
        <div className="min-h-screen bg-background p-6 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground tracking-tight">{project.name}</h1>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
                            {project.address}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" onClick={() => exportProjectReport(project)} icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="17 8 12 3 7 8" />
                                <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                        }>Export</Button>
                        <Button variant="primary" icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        }>Neues Projekt</Button>
                    </div>
                </div>

                {/* Key Metrics / Ring Charts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="col-span-1 md:col-span-2">
                        <CardHeader>
                            <h3 className="font-semibold text-foreground">Gesamtprojektfortschritt</h3>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center justify-around py-8 gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <CircularProgress percentage={progress.totalPercentage} size={160} strokeWidth={12} color="stroke-accent" />
                                <span className="text-sm font-medium text-muted-foreground">Baufortschritt</span>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <CircularProgress percentage={daysRemaining > 0 ? Math.min(100, Math.round(100 - (progress.blockedCount / Math.max(1, progress.trades.reduce((sum, t) => sum + t.total, 0)) * 100))) : 0} size={160} strokeWidth={12} color="stroke-success" />
                                <span className="text-sm font-medium text-muted-foreground">Termintreue</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <h3 className="font-semibold text-foreground">Baustellenanfragen</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 rounded-lg bg-warning-muted flex items-start gap-3">
                                <svg className="text-warning mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Elektroinstallation 03</p>
                                    <p className="text-xs text-warning mt-1">Behinderungsanzeige: Nässe</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-success-muted flex items-start gap-3">
                                <svg className="text-success mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Baustellensicherheit</p>
                                    <p className="text-xs text-success mt-1">Abnahme erfolgreich</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-muted flex items-start gap-3">
                                <svg className="text-muted-foreground mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Neue Pläne: Statik</p>
                                    <p className="text-xs text-muted-foreground mt-1">Gestern hochgeladen</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs & Content */}
                <div className="space-y-6">
                    <div className="overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                        <div className="flex gap-1 bg-surface p-1.5 rounded-xl border border-border inline-flex min-w-max" style={{ boxShadow: 'var(--shadow-xs)' }}>
                            {(['overview', 'tasks', 'photos'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 sm:px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${activeTab === tab
                                        ? 'bg-foreground text-background shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                        }`}
                                >
                                    {tab === 'overview' ? 'Detailliste' : tab === 'tasks' ? 'Aufgaben' : 'Fotos'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {activeTab === 'overview' && <OverviewTab progress={progress} project={project} />}
                    {activeTab === 'tasks' && <TasksTab project={project} expandedTrade={expandedTrade} onExpandTrade={setExpandedTrade} onUpdateStatus={onUpdateTaskStatus} />}
                    {activeTab === 'photos' && <PhotosTab project={project} onToggleVisibility={onTogglePhotoVisibility} />}
                </div>
            </div>
        </div>
    );
}

function OverviewTab({ progress, project }: { progress: ReturnType<typeof calculateProjectProgress>; project: Project }) {
    const blockedTasks = project.trades.flatMap(trade =>
        trade.tasks
            .filter(t => t.status === 'blocked')
            .map(t => ({ ...t, tradeName: trade.name }))
    );

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-foreground">Fortschritt nach Gewerk</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    {progress.trades.map((trade) => (
                        <div key={trade.tradeId}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground">{trade.tradeName}</span>
                                <span className="text-xs text-muted-foreground tabular-nums">
                                    {trade.done}/{trade.total} erledigt
                                </span>
                            </div>
                            <ProgressBar percentage={trade.percentage} size="sm" showLabel={false} />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {blockedTasks.length > 0 && (
                <Card className="border-warning/30 bg-warning-muted">
                    <CardHeader className="border-warning/20">
                        <h3 className="font-semibold text-warning flex items-center gap-2">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Blockierte Aufgaben ({blockedTasks.length})
                        </h3>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {blockedTasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-2 text-sm">
                                <span className="text-warning font-medium">{task.tradeName}:</span>
                                <div>
                                    <span className="text-foreground">{task.title}</span>
                                    {task.blockedReason && (
                                        <p className="text-muted-foreground text-xs mt-0.5">{task.blockedReason}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function TasksTab({
    project,
    expandedTrade,
    onExpandTrade,
    onUpdateStatus
}: {
    project: Project;
    expandedTrade: string | null;
    onExpandTrade: (id: string | null) => void;
    onUpdateStatus?: (taskId: string, status: TaskStatus) => void;
}) {
    return (
        <div className="space-y-3">
            {project.trades.map((trade) => (
                <Card key={trade.id}>
                    <button
                        onClick={() => onExpandTrade(expandedTrade === trade.id ? null : trade.id)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left"
                    >
                        <div>
                            <span className="font-medium text-foreground">{trade.name}</span>
                            {trade.contractorName && (
                                <span className="text-sm text-muted-foreground ml-2">({trade.contractorName})</span>
                            )}
                        </div>
                        <svg className="text-muted-foreground transition-transform duration-200" style={{ transform: expandedTrade === trade.id ? 'rotate(180deg)' : 'rotate(0deg)' }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </button>

                    {expandedTrade === trade.id && (
                        <div className="border-t border-border px-4 py-3 space-y-2">
                            {trade.tasks.map((task) => (
                                <TaskRow key={task.id} task={task} onUpdateStatus={onUpdateStatus} />
                            ))}
                        </div>
                    )}
                </Card>
            ))}
        </div>
    );
}

function TaskRow({
    task,
    onUpdateStatus
}: {
    task: Task;
    onUpdateStatus?: (taskId: string, status: TaskStatus) => void;
}) {
    const statuses: TaskStatus[] = ['pending', 'in_progress', 'done', 'blocked'];

    return (
        <div className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <StatusBadge status={task.status} showLabel={false} size="sm" />
                <span className="text-sm text-foreground truncate">{task.title}</span>
                {task.photos.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                        {task.photos.length}
                    </span>
                )}
                {task.comments.length > 0 && (
                    <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {task.comments.length}
                    </span>
                )}
            </div>
            {onUpdateStatus && (
                <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                    className="text-xs border border-border rounded-lg px-2 py-1.5 bg-surface text-foreground"
                >
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {s === 'pending' ? 'Offen' : s === 'in_progress' ? 'In Arbeit' : s === 'done' ? 'Erledigt' : 'Blockiert'}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}

function PhotosTab({
    project,
    onToggleVisibility
}: {
    project: Project;
    onToggleVisibility?: (photoId: string) => void;
}) {
    const allPhotos = project.trades.flatMap(trade =>
        trade.tasks.flatMap(task =>
            task.photos.map(photo => ({
                ...photo,
                tradeName: trade.name,
                taskTitle: task.title,
            }))
        )
    );

    if (allPhotos.length === 0) {
        return (
            <Card>
                <CardContent className="text-center py-12">
                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <svg className="text-muted-foreground" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                    </div>
                    <p className="text-muted-foreground">Noch keine Fotos hochgeladen</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {allPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                        <svg className="text-muted-foreground" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                    </div>
                    <CardContent className="py-2">
                        <p className="text-xs font-medium text-foreground truncate">{photo.taskTitle}</p>
                        <p className="text-xs text-muted-foreground">{photo.tradeName}</p>
                        <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${photo.visibility === 'client'
                                ? 'bg-success-muted text-success'
                                : 'bg-muted text-muted-foreground'
                                }`}>
                                {photo.visibility === 'client' ? 'Kunde sieht' : 'Nur intern'}
                            </span>
                            {onToggleVisibility && (
                                <button
                                    onClick={() => onToggleVisibility(photo.id)}
                                    className="text-xs text-accent hover:text-accent-light transition-colors"
                                >
                                    {photo.visibility === 'client' ? 'Verbergen' : 'Freigeben'}
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
