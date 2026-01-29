'use client';

import { useState } from 'react';
import { Project, Trade, Task, TaskStatus } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
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
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4 pb-20">
                {/* Project Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                        <p className="text-sm text-gray-500">{project.address}</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Kunde: {project.clientName}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">{progress.totalPercentage}%</span>
                        <p className="text-sm text-gray-500">
                            Ziel: {formatDate(project.targetEndDate)}
                        </p>
                        {daysRemaining > 0 ? (
                            <p className="text-xs text-gray-400">({daysRemaining} Tage)</p>
                        ) : (
                            <p className="text-xs text-red-500">(Überfällig)</p>
                        )}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <Card>
                        <CardContent className="py-3 text-center">
                            <span className="text-2xl font-bold text-gray-900">
                                {project.trades.reduce((sum, t) => sum + t.tasks.length, 0)}
                            </span>
                            <p className="text-xs text-gray-500">Aufgaben</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3 text-center">
                            <span className="text-2xl font-bold text-orange-500">
                                {progress.blockedCount}
                            </span>
                            <p className="text-xs text-gray-500">Blockiert</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3 text-center">
                            <span className="text-2xl font-bold text-green-600">
                                {progress.trades.filter(t => t.percentage === 100).length}
                            </span>
                            <p className="text-xs text-gray-500">Gewerke fertig</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-lg">
                    {(['overview', 'tasks', 'photos'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            {tab === 'overview' ? 'Übersicht' : tab === 'tasks' ? 'Aufgaben' : 'Fotos'}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <OverviewTab progress={progress} project={project} />
                )}
                {activeTab === 'tasks' && (
                    <TasksTab
                        project={project}
                        expandedTrade={expandedTrade}
                        onExpandTrade={setExpandedTrade}
                        onUpdateStatus={onUpdateTaskStatus}
                    />
                )}
                {activeTab === 'photos' && (
                    <PhotosTab
                        project={project}
                        onToggleVisibility={onTogglePhotoVisibility}
                    />
                )}
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
