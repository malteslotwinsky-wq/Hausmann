'use client';

import { Project, Trade } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { calculateTradeProgress, formatDate } from '@/lib/utils';

interface TimelineViewProps {
    project: Project;
}

export function TimelineView({ project }: TimelineViewProps) {
    const startDate = project.startDate;
    const endDate = project.targetEndDate;
    const today = new Date();

    // Calculate total project duration in days
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const progressPercent = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

    // Generate month markers
    const months = generateMonthMarkers(startDate, endDate);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Projekt-Timeline</h2>
                    <p className="text-sm text-gray-500">{project.name}</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Zeitraum</p>
                    <p className="font-medium text-gray-900">
                        {formatDate(startDate)} – {formatDate(endDate)}
                    </p>
                </div>
            </div>

            {/* Timeline Container */}
            <Card>
                <CardContent className="py-6 overflow-x-auto">
                    <div className="min-w-[600px]">
                        {/* Month Headers */}
                        <div className="flex mb-2 border-b border-gray-200 pb-2">
                            <div className="w-40 flex-shrink-0" />
                            <div className="flex-1 flex">
                                {months.map((month, idx) => (
                                    <div
                                        key={idx}
                                        className="text-xs font-medium text-gray-500 text-center"
                                        style={{ width: `${month.widthPercent}%` }}
                                    >
                                        {month.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Today Marker */}
                        <div className="relative flex mb-4">
                            <div className="w-40 flex-shrink-0" />
                            <div className="flex-1 relative h-6">
                                {progressPercent > 0 && progressPercent < 100 && (
                                    <div
                                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                                        style={{ left: `${progressPercent}%` }}
                                    >
                                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                                            Heute
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Trades */}
                        <div className="space-y-3">
                            {project.trades.map((trade) => (
                                <TradeBar key={trade.id} trade={trade} totalDays={totalDays} startDate={startDate} />
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-3 bg-green-500 rounded" />
                                <span>Erledigt</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-3 bg-blue-500 rounded" />
                                <span>In Arbeit</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-3 bg-gray-200 rounded" />
                                <span>Geplant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-3 bg-orange-500 rounded" />
                                <span>Blockiert</span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Trade Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {project.trades.map((trade) => {
                    const progress = calculateTradeProgress(trade);
                    return (
                        <Card key={trade.id}>
                            <CardContent className="py-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-900">{trade.name}</span>
                                    <span className="text-sm font-semibold text-blue-600">{progress.percentage}%</span>
                                </div>
                                <div className="flex gap-1 text-xs text-gray-500">
                                    <span className="text-green-600">{progress.done} erledigt</span>
                                    <span>·</span>
                                    <span className="text-blue-600">{progress.inProgress} in Arbeit</span>
                                    <span>·</span>
                                    <span className="text-gray-400">{progress.open} offen</span>
                                    {progress.blocked > 0 && (
                                        <>
                                            <span>·</span>
                                            <span className="text-orange-600">{progress.blocked} blockiert</span>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

function TradeBar({ trade, totalDays, startDate }: { trade: Trade; totalDays: number; startDate: Date }) {
    const progress = calculateTradeProgress(trade);

    // Calculate bar positions (simplified - in real app would use actual dates)
    const tradeIndex = trade.order - 1;
    const barStartPercent = (tradeIndex * 15) % 50; // Staggered start
    const barWidthPercent = 100 - barStartPercent - 10;

    // Get color based on status
    const getColor = () => {
        if (progress.blocked > 0) return 'bg-orange-500';
        if (progress.percentage === 100) return 'bg-green-500';
        if (progress.percentage > 0) return 'bg-blue-500';
        return 'bg-gray-300';
    };

    return (
        <div className="flex items-center">
            {/* Trade Name */}
            <div className="w-40 flex-shrink-0 pr-4">
                <span className="text-sm font-medium text-gray-900 truncate block">{trade.name}</span>
                {trade.contractorName && (
                    <span className="text-xs text-gray-500 truncate block">{trade.contractorName}</span>
                )}
            </div>

            {/* Bar */}
            <div className="flex-1 relative h-8">
                <div className="absolute inset-0 bg-gray-100 rounded-lg" />

                {/* Progress Bar */}
                <div
                    className={`absolute top-1 bottom-1 ${getColor()} rounded-md transition-all duration-500`}
                    style={{
                        left: `${barStartPercent}%`,
                        width: `${(barWidthPercent * progress.percentage) / 100}%`
                    }}
                >
                    {progress.percentage > 0 && (
                        <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-medium">
                            {progress.percentage > 20 ? `${progress.percentage}%` : ''}
                        </span>
                    )}
                </div>

                {/* Planned Bar (background) */}
                <div
                    className="absolute top-1 bottom-1 bg-gray-200 rounded-md opacity-50"
                    style={{
                        left: `${barStartPercent + (barWidthPercent * progress.percentage) / 100}%`,
                        width: `${(barWidthPercent * (100 - progress.percentage)) / 100}%`
                    }}
                />
            </div>
        </div>
    );
}

function generateMonthMarkers(startDate: Date, endDate: Date): { label: string; widthPercent: number }[] {
    const months: { label: string; widthPercent: number }[] = [];
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const current = new Date(startDate);
    current.setDate(1); // Start of month

    while (current <= endDate) {
        const monthStart = new Date(current);
        current.setMonth(current.getMonth() + 1);
        const monthEnd = new Date(Math.min(current.getTime(), endDate.getTime()));

        const daysInRange = Math.ceil((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24));
        const widthPercent = (daysInRange / totalDays) * 100;

        months.push({
            label: new Intl.DateTimeFormat('de-DE', { month: 'short' }).format(monthStart),
            widthPercent,
        });
    }

    return months;
}
