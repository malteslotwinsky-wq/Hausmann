'use client';

import { useMemo } from 'react';
import { Trade } from '@/types';

interface GanttTimelineProps {
    trades: Trade[];
    projectStartDate: Date;
    projectEndDate: Date;
    onTradeClick?: (trade: Trade) => void;
}

/**
 * Gantt-style timeline visualization for project trades
 */
export function GanttTimeline({
    trades,
    projectStartDate,
    projectEndDate,
    onTradeClick,
}: GanttTimelineProps) {
    // Calculate timeline parameters
    const { months, totalDays, getPositionPercent, getWidthPercent } = useMemo(() => {
        const start = new Date(projectStartDate);
        const end = new Date(projectEndDate);

        // Calculate total days
        const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

        // Generate month labels
        const months: { label: string; startPercent: number; widthPercent: number }[] = [];
        const currentDate = new Date(start.getFullYear(), start.getMonth(), 1);

        while (currentDate <= end) {
            const monthStart = new Date(Math.max(currentDate.getTime(), start.getTime()));
            const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
            const monthEnd = new Date(Math.min(nextMonth.getTime() - 1, end.getTime()));

            const startDays = Math.ceil((monthStart.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const endDays = Math.ceil((monthEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

            months.push({
                label: currentDate.toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
                startPercent: (startDays / totalDays) * 100,
                widthPercent: ((endDays - startDays + 1) / totalDays) * 100,
            });

            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        const getPositionPercent = (date: Date): number => {
            const days = Math.ceil((new Date(date).getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return Math.max(0, Math.min(100, (days / totalDays) * 100));
        };

        const getWidthPercent = (startDate: Date, endDate: Date): number => {
            const startDays = Math.ceil((new Date(startDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            const endDays = Math.ceil((new Date(endDate).getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
            return Math.max(2, ((endDays - startDays + 1) / totalDays) * 100);
        };

        return { months, totalDays, getPositionPercent, getWidthPercent };
    }, [projectStartDate, projectEndDate]);

    // Today marker
    const today = new Date();
    const todayPercent = useMemo(() => {
        if (today < projectStartDate || today > projectEndDate) return null;
        const days = Math.ceil((today.getTime() - new Date(projectStartDate).getTime()) / (1000 * 60 * 60 * 24));
        return (days / totalDays) * 100;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [projectStartDate, projectEndDate, totalDays]);

    // Colors for trades
    const tradeColors = [
        'bg-blue-500',
        'bg-emerald-500',
        'bg-amber-500',
        'bg-purple-500',
        'bg-rose-500',
        'bg-cyan-500',
        'bg-orange-500',
        'bg-indigo-500',
        'bg-teal-500',
        'bg-pink-500',
    ];

    // Dot colors matching trade bar colors
    const dotColors = [
        'bg-blue-500',
        'bg-emerald-500',
        'bg-amber-500',
        'bg-purple-500',
        'bg-rose-500',
        'bg-cyan-500',
        'bg-orange-500',
        'bg-indigo-500',
        'bg-teal-500',
        'bg-pink-500',
    ];

    if (trades.length === 0) {
        return (
            <div className="card-mobile text-center py-8">
                <span className="text-4xl block mb-2">📊</span>
                <p className="text-muted-foreground">Keine Gewerke mit Terminen</p>
            </div>
        );
    }

    return (
        <div className="card-mobile overflow-hidden">
            <h3 className="font-semibold text-foreground mb-4">📊 Timeline</h3>

            {/* === Mobile Card View === */}
            <div className="sm:hidden space-y-2">
                {trades.map((trade, index) => {
                    const startDate = trade.startDate || projectStartDate;
                    const endDate = trade.endDate || projectEndDate;
                    const colorClass = dotColors[index % dotColors.length];

                    return (
                        <button
                            key={trade.id}
                            onClick={() => onTradeClick?.(trade)}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/50 tap-active text-left"
                        >
                            <span className={`w-3 h-3 rounded-full ${colorClass} shrink-0`} />
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-foreground truncate">{trade.name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    {new Date(startDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })} – {new Date(endDate).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })}
                                    {trade.companyName && ` · ${trade.companyName}`}
                                </p>
                            </div>
                            <svg className="text-muted-foreground shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
                        </button>
                    );
                })}
            </div>

            {/* === Desktop Gantt View === */}
            <div className="hidden sm:block">
                {/* Month headers */}
                <div className="relative h-8 bg-muted rounded-lg mb-2 overflow-hidden">
                    {months.map((month, i) => (
                        <div
                            key={i}
                            className="absolute top-0 h-full flex items-center justify-center text-xs text-muted-foreground border-r border-border last:border-r-0"
                            style={{
                                left: `${month.startPercent}%`,
                                width: `${month.widthPercent}%`,
                            }}
                        >
                            <span className="truncate px-1">{month.label}</span>
                        </div>
                    ))}
                </div>

                {/* Trade bars */}
                <div className="space-y-2 relative">
                    {/* Today marker */}
                    {todayPercent !== null && (
                        <div
                            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10"
                            style={{ left: `${todayPercent}%` }}
                        >
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                    )}

                    {trades.map((trade, index) => {
                        const startDate = trade.startDate || projectStartDate;
                        const endDate = trade.endDate || projectEndDate;
                        const left = getPositionPercent(startDate);
                        const width = getWidthPercent(startDate, endDate);
                        const colorClass = tradeColors[index % tradeColors.length];

                        return (
                            <div key={trade.id} className="flex items-center gap-2 h-8">
                                {/* Trade name (fixed width) */}
                                <div className="w-24 flex-shrink-0 text-xs text-foreground truncate">
                                    {trade.name}
                                </div>

                                {/* Bar container */}
                                <div className="flex-1 relative h-6 bg-muted/50 rounded">
                                    <button
                                        onClick={() => onTradeClick?.(trade)}
                                        className={`absolute h-full rounded ${colorClass} hover:opacity-80 transition-opacity tap-active flex items-center justify-center`}
                                        style={{
                                            left: `${left}%`,
                                            width: `${width}%`,
                                            minWidth: '8px',
                                        }}
                                        title={`${trade.name}: ${new Date(startDate).toLocaleDateString('de-DE')} - ${new Date(endDate).toLocaleDateString('de-DE')}`}
                                    >
                                        {width > 10 && (
                                            <span className="text-white text-xs font-medium truncate px-1">
                                                {trade.companyName || ''}
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span>
                    {new Date(projectStartDate).toLocaleDateString('de-DE')} —{' '}
                    {new Date(projectEndDate).toLocaleDateString('de-DE')}
                </span>
                {todayPercent !== null && (
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-red-500 rounded-full" />
                        Heute
                    </span>
                )}
            </div>
        </div>
    );
}
