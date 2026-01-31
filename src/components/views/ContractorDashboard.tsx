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
        <div className="min-h-screen bg-gray-900 text-white pb-20">
            {/* Dark Mobile Header */}
            <div className="p-6 bg-gray-900 border-b border-gray-800">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Mein Bauprojekt</p>
                        <h1 className="text-xl font-bold text-white">{project.name}</h1>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Hero Section: Today's Tasks */}
                <div className="bg-white rounded-2xl p-6 text-gray-900 shadow-xl">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        Meine Aufgaben - HEUTE
                    </h2>

                    {myTasks.length > 0 ? (
                        <div className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded-xl border-l-4 border-accent">
                                <p className="font-bold text-lg">{myTasks[0].title}</p>
                                <p className="text-sm text-gray-500 mt-1">Fällig: {myTasks[0].dueDate ? formatDate(myTasks[0].dueDate) : 'Kein Datum'}</p>
                            </div>

                            {/* Big Action Buttons */}
                            <div className="grid grid-cols-2 gap-4 mt-6">
                                <button
                                    onClick={() => onUpdateTaskStatus?.(myTasks[0].id, 'in_progress')}
                                    className="py-6 rounded-xl bg-gray-800 text-white font-bold text-lg hover:bg-gray-700 active:scale-95 transition-all shadow-lg flex flex-col items-center justify-center gap-2"
                                >
                                    <span>🚛</span>
                                    In Anfahrt
                                </button>
                                <button
                                    onClick={() => onUpdateTaskStatus?.(myTasks[0].id, 'done')}
                                    className="py-6 rounded-xl bg-green-600 text-white font-bold text-lg hover:bg-green-700 active:scale-95 transition-all shadow-lg flex flex-col items-center justify-center gap-2"
                                >
                                    <span>✓</span>
                                    Erledigt
                                </button>
                            </div>

                            <button className="w-full py-4 mt-4 rounded-xl bg-orange-500 text-white font-bold hover:bg-orange-600 active:scale-95 transition-all shadow-lg">
                                ⚠️ Problem melden
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-400">
                            <p>Keine offenen Aufgaben für heute 🎉</p>
                        </div>
                    )}
                </div>

                {/* Upcoming List */}
                <div>
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Demnächst</h3>
                    <div className="space-y-3">
                        {myTasks.slice(1).map(task => (
                            <div key={task.id} className="bg-gray-800 p-4 rounded-xl flex items-center justify-between border border-gray-700">
                                <div>
                                    <p className="font-medium text-white">{task.title}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{task.dueDate ? formatDate(task.dueDate) : ''}</p>
                                </div>
                                <StatusBadge status={task.status} size="sm" />
                            </div>
                        ))}
                    </div>
                </div>
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
    // This component is mostly used in legacy view, but kept for type safety or fallback
    return null;
}
