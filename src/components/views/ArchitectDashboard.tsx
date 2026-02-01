'use client';

import { useState } from 'react';
import { Project, Trade, Task, TaskStatus } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { calculateProjectProgress, formatDate, getDaysUntil } from '@/lib/utils';

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
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-primary tracking-tight">{project.name}</h1>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-accent"></span>
                            {project.address}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" icon={<span>📤</span>}>Export</Button>
                        <Button variant="primary" icon={<span>+</span>}>Neues Projekt</Button>
                    </div>
                </div>

                {/* Key Metrics / Ring Charts */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="col-span-1 md:col-span-2 shadow-sm border-border/60">
                        <CardHeader>
                            <h3 className="font-semibold text-primary">Gesamtprojektfortschritt</h3>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center justify-around py-8 gap-8">
                            <div className="flex flex-col items-center gap-4">
                                <CircularProgress percentage={78} size={160} strokeWidth={12} color="stroke-accent" />
                                <span className="text-sm font-medium text-muted-foreground">Baufortschritt</span>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <CircularProgress percentage={92} size={160} strokeWidth={12} color="stroke-green-500" />
                                <span className="text-sm font-medium text-muted-foreground">Termintreue</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/60">
                        <CardHeader>
                            <h3 className="font-semibold text-primary">Baustellenanfragen</h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-3 rounded-lg bg-orange-50 border border-orange-100 flex items-start gap-3">
                                <span className="text-orange-500 mt-1">⚠️</span>
                                <div>
                                    <p className="text-sm font-medium text-primary">Elektroinstallation 03</p>
                                    <p className="text-xs text-orange-600 mt-1">Behinderungsanzeige: Nässe</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-green-50 border border-green-100 flex items-start gap-3">
                                <span className="text-green-500 mt-1">✓</span>
                                <div>
                                    <p className="text-sm font-medium text-primary">Baustellensicherheit</p>
                                    <p className="text-xs text-green-700 mt-1">Abnahme erfolgreich</p>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-100 flex items-start gap-3">
                                <span className="text-gray-400 mt-1">ℹ</span>
                                <div>
                                    <p className="text-sm font-medium text-primary">Neue Pläne: Statik</p>
                                    <p className="text-xs text-gray-500 mt-1">Gestern hochgeladen</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs & Content */}
                <div className="space-y-6">
                    {/* Mobile-optimized horizontal scrolling tabs */}
                    <div className="overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
                        <div className="flex gap-1 bg-white p-1.5 rounded-xl border border-border inline-flex shadow-sm min-w-max">
                            {(['overview', 'tasks', 'photos'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 sm:px-6 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 whitespace-nowrap ${activeTab === tab
                                        ? 'bg-primary text-white shadow-md'
                                        : 'text-muted-foreground hover:text-primary hover:bg-gray-50'
                                        }`}
                                >
                                    {tab === 'overview' ? '📋 Detailliste' : tab === 'tasks' ? '✅ Aufgaben' : '📸 Fotos'}
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
    // Find blocked tasks
    const blockedTasks = project.trades.flatMap(trade =>
        trade.tasks
            .filter(t => t.status === 'blocked')
            .map(t => ({ ...t, tradeName: trade.name }))
    );

    return (
        <div className="space-y-4">
            {/* Progress by Trade */}
            <Card>
                <CardHeader>
                    <h3 className="font-semibold text-gray-900">Fortschritt nach Gewerk</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                    {progress.trades.map((trade) => (
                        <div key={trade.tradeId}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">{trade.tradeName}</span>
                                <span className="text-xs text-gray-500">
                                    {trade.done}/{trade.total} erledigt
                                </span>
                            </div>
                            <ProgressBar percentage={trade.percentage} size="sm" showLabel={false} />
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Blocked Tasks Alert */}
            {blockedTasks.length > 0 && (
                <Card className="border-orange-200 bg-orange-50">
                    <CardHeader className="border-orange-100">
                        <h3 className="font-semibold text-orange-800 flex items-center gap-2">
                            <span>⚠</span> Blockierte Aufgaben ({blockedTasks.length})
                        </h3>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {blockedTasks.map((task) => (
                            <div key={task.id} className="flex items-start gap-2 text-sm">
                                <span className="text-orange-600 font-medium">{task.tradeName}:</span>
                                <div>
                                    <span className="text-gray-900">{task.title}</span>
                                    {task.blockedReason && (
                                        <p className="text-gray-500 text-xs mt-0.5">{task.blockedReason}</p>
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
                            <span className="font-medium text-gray-900">{trade.name}</span>
                            {trade.contractorName && (
                                <span className="text-sm text-gray-500 ml-2">({trade.contractorName})</span>
                            )}
                        </div>
                        <span className="text-gray-400">
                            {expandedTrade === trade.id ? '−' : '+'}
                        </span>
                    </button>

                    {expandedTrade === trade.id && (
                        <div className="border-t border-gray-100 px-4 py-3 space-y-2">
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
    const statuses: TaskStatus[] = ['open', 'in_progress', 'done', 'blocked'];

    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <StatusBadge status={task.status} showLabel={false} size="sm" />
                <span className="text-sm text-gray-900 truncate">{task.title}</span>
                {task.photos.length > 0 && (
                    <span className="text-xs text-gray-400">📷 {task.photos.length}</span>
                )}
                {task.comments.length > 0 && (
                    <span className="text-xs text-gray-400">💬 {task.comments.length}</span>
                )}
            </div>
            {onUpdateStatus && (
                <select
                    value={task.status}
                    onChange={(e) => onUpdateStatus(task.id, e.target.value as TaskStatus)}
                    className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                >
                    {statuses.map((s) => (
                        <option key={s} value={s}>
                            {s === 'open' ? 'Offen' : s === 'in_progress' ? 'In Arbeit' : s === 'done' ? 'Erledigt' : 'Blockiert'}
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
                <CardContent className="text-center py-8">
                    <p className="text-gray-500">Noch keine Fotos hochgeladen</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            {allPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden">
                    <div className="aspect-square bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl">📷</span>
                    </div>
                    <CardContent className="py-2">
                        <p className="text-xs font-medium text-gray-900 truncate">{photo.taskTitle}</p>
                        <p className="text-xs text-gray-500">{photo.tradeName}</p>
                        <div className="flex items-center justify-between mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${photo.visibility === 'client'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-600'
                                }`}>
                                {photo.visibility === 'client' ? 'Kunde sieht' : 'Nur intern'}
                            </span>
                            {onToggleVisibility && (
                                <button
                                    onClick={() => onToggleVisibility(photo.id)}
                                    className="text-xs text-blue-600 hover:text-blue-700"
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
