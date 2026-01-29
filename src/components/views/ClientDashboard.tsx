'use client';

import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { CircularProgress, ProgressBar } from '@/components/ui/ProgressBar';
import { SimpleStatusBadge } from '@/components/ui/StatusBadge';
import { calculateProjectProgress, getSimplifiedStatus, formatDate, getDaysUntil } from '@/lib/utils';

interface ClientDashboardProps {
    project: Project;
}

export function ClientDashboard({ project }: ClientDashboardProps) {
    const progress = calculateProjectProgress(project);
    const daysRemaining = getDaysUntil(project.targetEndDate);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-lg mx-auto p-4 pb-20">
                {/* Project Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                    <p className="text-sm text-gray-500">{project.address}</p>
                </div>

                {/* Progress Circle */}
                <Card className="mb-6">
                    <CardContent className="flex flex-col items-center py-8">
                        <CircularProgress percentage={progress.totalPercentage} size={140} strokeWidth={10} />
                        <p className="text-gray-600 mt-4 font-medium">Gesamtfortschritt</p>
                        <p className="text-sm text-gray-500 mt-1">
                            Fertigstellung geplant: {formatDate(project.targetEndDate)}
                        </p>
                        {daysRemaining > 0 && (
                            <p className="text-sm text-blue-600 mt-1">
                                Noch {daysRemaining} Tage
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Trades Overview */}
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">Gewerke</h2>
                    <div className="space-y-3">
                        {progress.trades.map((trade) => {
                            const simpleStatus = getSimplifiedStatus(trade);
                            return (
                                <Card key={trade.tradeId}>
                                    <CardContent className="py-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{trade.tradeName}</span>
                                            <SimpleStatusBadge status={simpleStatus} showLabel={false} />
                                        </div>
                                        <ProgressBar percentage={trade.percentage} size="sm" />
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Construction Diary Preview */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">Bautagebuch</h2>
                        <button className="text-sm text-blue-600 font-medium hover:text-blue-700">
                            PDF Export →
                        </button>
                    </div>
                    <Card>
                        <CardContent>
                            <DiaryPreview project={project} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function DiaryPreview({ project }: { project: Project }) {
    // Get recent client-visible activities
    const recentActivities: { date: Date; trade: string; task: string; type: string }[] = [];

    project.trades.forEach(trade => {
        trade.tasks.forEach(task => {
            if (task.status === 'done') {
                recentActivities.push({
                    date: task.updatedAt,
                    trade: trade.name,
                    task: task.title,
                    type: 'completed',
                });
            }
            // Add client-visible photos
            task.photos
                .filter(p => p.visibility === 'client')
                .forEach(photo => {
                    recentActivities.push({
                        date: photo.uploadedAt,
                        trade: trade.name,
                        task: photo.caption || task.title,
                        type: 'photo',
                    });
                });
        });
    });

    // Sort by date descending and take last 5
    const sorted = recentActivities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

    if (sorted.length === 0) {
        return <p className="text-gray-500 text-sm">Noch keine Einträge</p>;
    }

    return (
        <div className="space-y-3">
            {sorted.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm">
                    <span className="text-gray-400 min-w-[4rem]">
                        {formatDate(activity.date)}
                    </span>
                    <div>
                        <span className="font-medium text-gray-900">{activity.trade}</span>
                        {' · '}
                        <span className="text-gray-600">{activity.task}</span>
                        {activity.type === 'photo' && (
                            <span className="ml-2 text-xs text-blue-500">📷</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
