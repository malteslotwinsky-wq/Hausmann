'use client';

import { useState } from 'react';
import { Project, Trade, Task, TaskStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
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
    onAddComment,
    onReportProblem,
}: ContractorDashboardProps) {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [showProblemModal, setShowProblemModal] = useState(false);
    const [problemReason, setProblemReason] = useState('');

    // Find trades assigned to this contractor
    const myTrades = project.trades.filter(t => t.contractorId === contractorId);
    const myTasks = myTrades.flatMap(trade =>
        trade.tasks.map(task => ({ ...task, tradeName: trade.name }))
    );

    // Separate by status for quick access
    const inProgressTasks = myTasks.filter(t => t.status === 'in_progress');
    const openTasks = myTasks.filter(t => t.status === 'open');
    const blockedTasks = myTasks.filter(t => t.status === 'blocked');

    const handleStatusChange = (taskId: string, status: TaskStatus) => {
        if (status === 'blocked') {
            const task = myTasks.find(t => t.id === taskId);
            if (task) {
                setSelectedTask(task);
                setShowProblemModal(true);
            }
        } else {
            onUpdateTaskStatus?.(taskId, status);
        }
    };

    const handleSubmitProblem = () => {
        if (selectedTask && problemReason.trim()) {
            onReportProblem?.(selectedTask.id, problemReason);
            setShowProblemModal(false);
            setProblemReason('');
            setSelectedTask(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-lg mx-auto p-4 pb-20">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-sm text-gray-500">
                        {myTrades.map(t => t.name).join(', ')}
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <Card className={inProgressTasks.length > 0 ? 'border-blue-200 bg-blue-50' : ''}>
                        <CardContent className="py-3 text-center">
                            <span className="text-2xl font-bold text-blue-600">{inProgressTasks.length}</span>
                            <p className="text-xs text-gray-600">In Arbeit</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="py-3 text-center">
                            <span className="text-2xl font-bold text-gray-600">{openTasks.length}</span>
                            <p className="text-xs text-gray-500">Offen</p>
                        </CardContent>
                    </Card>
                    <Card className={blockedTasks.length > 0 ? 'border-orange-200 bg-orange-50' : ''}>
                        <CardContent className="py-3 text-center">
                            <span className="text-2xl font-bold text-orange-500">{blockedTasks.length}</span>
                            <p className="text-xs text-gray-600">Blockiert</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Today's Tasks / In Progress */}
                {inProgressTasks.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Aktuelle Aufgaben</h2>
                        <div className="space-y-3">
                            {inProgressTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    tradeName={task.tradeName}
                                    onStatusChange={handleStatusChange}
                                    onAddPhoto={onAddPhoto}
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Open Tasks */}
                {openTasks.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3">Anstehende Aufgaben</h2>
                        <div className="space-y-3">
                            {openTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    tradeName={task.tradeName}
                                    onStatusChange={handleStatusChange}
                                    onAddPhoto={onAddPhoto}
                                    compact
                                />
                            ))}
                        </div>
                    </div>
                )}

                {/* Blocked Tasks */}
                {blockedTasks.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <span className="text-orange-500">⚠</span> Blockiert
                        </h2>
                        <div className="space-y-3">
                            {blockedTasks.map((task) => (
                                <Card key={task.id} className="border-orange-200">
                                    <CardContent className="py-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="font-medium text-gray-900">{task.title}</span>
                                                <p className="text-sm text-orange-600 mt-1">{task.blockedReason}</p>
                                            </div>
                                            <StatusBadge status="blocked" showLabel={false} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Report Problem Button */}
                <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto">
                    <Button
                        variant="secondary"
                        fullWidth
                        icon={<span>⚠</span>}
                        onClick={() => setShowProblemModal(true)}
                    >
                        Problem melden
                    </Button>
                </div>

                {/* Problem Modal */}
                {showProblemModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <Card className="w-full max-w-md">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Problem melden</h3>
                                <textarea
                                    value={problemReason}
                                    onChange={(e) => setProblemReason(e.target.value)}
                                    placeholder="Was ist das Problem?"
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <div className="flex gap-3 mt-4">
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        onClick={() => {
                                            setShowProblemModal(false);
                                            setProblemReason('');
                                        }}
                                    >
                                        Abbrechen
                                    </Button>
                                    <Button
                                        variant="danger"
                                        fullWidth
                                        onClick={handleSubmitProblem}
                                        disabled={!problemReason.trim()}
                                    >
                                        Melden
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

interface TaskCardProps {
    task: Task & { tradeName: string };
    tradeName: string;
    onStatusChange?: (taskId: string, status: TaskStatus) => void;
    onAddPhoto?: (taskId: string) => void;
    compact?: boolean;
}

function TaskCard({ task, tradeName, onStatusChange, onAddPhoto, compact = false }: TaskCardProps) {
    const statuses: { status: TaskStatus; label: string }[] = [
        { status: 'open', label: '○' },
        { status: 'in_progress', label: '→' },
        { status: 'done', label: '✓' },
    ];

    return (
        <Card>
            <CardContent className={compact ? 'py-3' : 'py-4'}>
                <div className="flex items-start justify-between mb-3">
                    <div>
                        <span className="font-medium text-gray-900">{task.title}</span>
                        <p className="text-xs text-gray-500">{tradeName}</p>
                    </div>
                    <StatusBadge status={task.status} showLabel={false} />
                </div>

                {/* Status Buttons */}
                <div className="flex gap-2 mb-3">
                    {statuses.map(({ status, label }) => (
                        <button
                            key={status}
                            onClick={() => onStatusChange?.(task.id, status)}
                            className={`flex-1 py-2.5 rounded-lg text-lg font-medium transition-colors ${task.status === status
                                    ? status === 'done'
                                        ? 'bg-green-500 text-white'
                                        : status === 'in_progress'
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-300 text-gray-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        icon={<span>📷</span>}
                        onClick={() => onAddPhoto?.(task.id)}
                    >
                        Foto
                    </Button>
                    <Button
                        variant="secondary"
                        size="sm"
                        fullWidth
                        icon={<span>💬</span>}
                    >
                        Kommentar
                    </Button>
                </div>

                {/* Photo count if any */}
                {task.photos.length > 0 && (
                    <p className="text-xs text-gray-400 mt-2">
                        {task.photos.length} Foto{task.photos.length > 1 ? 's' : ''} hochgeladen
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
