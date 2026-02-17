'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Project, Trade, TaskStatus } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';
import { calculateProjectProgress, formatDate } from '@/lib/utils';
import { exportProjectReport } from '@/lib/pdf-export';

interface ArchitectDashboardProps {
    project: Project;
    userName?: string;
    onUpdateTaskStatus?: (taskId: string, status: TaskStatus) => void;
    onTogglePhotoVisibility?: (photoId: string) => void;
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 11) return 'Guten Morgen';
    if (hour < 17) return 'Guten Tag';
    return 'Guten Abend';
}

function getGermanDateString(): string {
    return new Intl.DateTimeFormat('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(new Date());
}

type TaskFilter = 'all' | 'open' | 'this_week';

function getWeekDays(): { label: string; date: Date; isToday: boolean }[] {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7)); // shift to Monday
    monday.setHours(0, 0, 0, 0);

    const labels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    const days: { label: string; date: Date; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push({
            label: labels[i],
            date: d,
            isToday: d.toDateString() === now.toDateString(),
        });
    }
    return days;
}

interface ActivityItem {
    id: string;
    type: 'done' | 'blocked' | 'photo' | 'in_progress';
    title: string;
    subtitle: string;
    time: Date;
}

function buildActivity(project: Project): ActivityItem[] {
    const items: ActivityItem[] = [];
    for (const trade of project.trades) {
        for (const task of trade.tasks) {
            if (task.status === 'done') {
                items.push({
                    id: `done-${task.id}`,
                    type: 'done',
                    title: `${task.title} erledigt`,
                    subtitle: `"${trade.name}" abgeschlossen`,
                    time: task.updatedAt,
                });
            }
            if (task.status === 'blocked') {
                items.push({
                    id: `blocked-${task.id}`,
                    type: 'blocked',
                    title: `Problem bei ${trade.name}`,
                    subtitle: task.blockedReason || task.title,
                    time: task.updatedAt,
                });
            }
            if (task.status === 'in_progress') {
                items.push({
                    id: `ip-${task.id}`,
                    type: 'in_progress',
                    title: `${task.title} gestartet`,
                    subtitle: trade.name,
                    time: task.updatedAt,
                });
            }
            for (const photo of task.photos) {
                items.push({
                    id: `photo-${photo.id}`,
                    type: 'photo',
                    title: 'Neues Foto',
                    subtitle: `${task.title} – ${trade.name}`,
                    time: photo.uploadedAt,
                });
            }
        }
    }
    items.sort((a, b) => b.time.getTime() - a.time.getTime());
    return items.slice(0, 5);
}

export function ArchitectDashboard({ project, userName, onUpdateTaskStatus, onTogglePhotoVisibility: _onTogglePhotoVisibility }: ArchitectDashboardProps) {
    const [taskFilter, setTaskFilter] = useState<TaskFilter>('all');
    const router = useRouter();
    const progress = calculateProjectProgress(project);

    // Compute stats
    const allTasks = project.trades.flatMap(t => t.tasks);
    const tasksDone = allTasks.filter(t => t.status === 'done').length;
    const tradesActive = project.trades.filter(t => t.tasks.some(task => task.status === 'in_progress')).length;
    const blockedCount = progress.blockedCount;

    // Flatten tasks with trade info
    const tasksWithTrade = useMemo(() => {
        const list = project.trades.flatMap(trade =>
            trade.tasks.map(task => ({ ...task, tradeName: trade.name }))
        );

        const now = new Date();
        const endOfWeek = new Date(now);
        const dayOfWeek = now.getDay();
        endOfWeek.setDate(now.getDate() + (7 - ((dayOfWeek + 6) % 7))); // next Monday
        endOfWeek.setHours(0, 0, 0, 0);

        switch (taskFilter) {
            case 'open':
                return list.filter(t => t.status !== 'done');
            case 'this_week':
                return list.filter(t => {
                    if (!t.dueDate) return t.status !== 'done';
                    return new Date(t.dueDate) <= endOfWeek && t.status !== 'done';
                });
            default:
                return list;
        }
    }, [project, taskFilter]);

    // Upcoming trade deadlines
    const upcomingDeadlines = useMemo(() => {
        const now = new Date();
        return project.trades
            .filter(t => t.endDate && new Date(t.endDate) >= now)
            .sort((a, b) => new Date(a.endDate!).getTime() - new Date(b.endDate!).getTime())
            .slice(0, 4);
    }, [project]);

    const weekDays = useMemo(() => getWeekDays(), []);
    const activity = useMemo(() => buildActivity(project), [project]);

    const displayName = userName?.split(' ')[0] || 'Bauleiter';

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 pb-32">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Greeting Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{getGermanDateString()}</p>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight mt-1">
                            {getGreeting()}, {displayName}!
                        </h1>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="secondary" size="sm" onClick={() => exportProjectReport(project)} icon={
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                            </svg>
                        }>Export</Button>
                        <Button variant="primary" size="sm" onClick={() => router.push('/admin/projects/new')} icon={
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        }>Neues Projekt</Button>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <Card>
                        <CardContent className="flex items-center gap-3 py-4">
                            <div className="w-10 h-10 rounded-xl bg-success-muted flex items-center justify-center shrink-0">
                                <svg className="text-success" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{tasksDone}</p>
                                <p className="text-xs text-muted-foreground truncate">Erledigt</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 py-4">
                            <div className="w-10 h-10 rounded-xl bg-info-muted flex items-center justify-center shrink-0">
                                <svg className="text-info" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{tradesActive}</p>
                                <p className="text-xs text-muted-foreground truncate">Gewerke aktiv</p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 py-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${blockedCount > 0 ? 'bg-warning-muted' : 'bg-muted'}`}>
                                <svg className={blockedCount > 0 ? 'text-warning' : 'text-muted-foreground'} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                    <line x1="12" y1="9" x2="12" y2="13" />
                                    <line x1="12" y1="17" x2="12.01" y2="17" />
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="text-xl md:text-2xl font-bold text-foreground tabular-nums">{blockedCount}</p>
                                <p className="text-xs text-muted-foreground truncate">Blockiert</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Task Table */}
                <Card>
                    <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60">
                        <h2 className="font-semibold text-foreground">Meine Aufgaben</h2>
                        <div className="flex items-center gap-2">
                            <div className="flex bg-muted rounded-lg p-0.5">
                                {([
                                    ['all', 'Alle'],
                                    ['open', 'Offen'],
                                    ['this_week', 'Diese Woche'],
                                ] as [TaskFilter, string][]).map(([key, label]) => (
                                    <button
                                        key={key}
                                        onClick={() => setTaskFilter(key)}
                                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                                            taskFilter === key
                                                ? 'bg-surface text-foreground shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={() => router.push('/tasks')}
                                className="text-xs text-accent hover:text-accent-light font-medium transition-colors whitespace-nowrap"
                            >
                                Alle anzeigen &rarr;
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border/40">
                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Aufgabe</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Gewerk</th>
                                    <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                                    {onUpdateTaskStatus && (
                                        <th className="text-right px-4 py-2.5 text-xs font-medium text-muted-foreground uppercase tracking-wider w-28"></th>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {tasksWithTrade.slice(0, 8).map((task) => (
                                    <tr key={task.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-foreground font-medium truncate max-w-[200px] md:max-w-none">{task.title}</span>
                                                {task.photos.length > 0 && (
                                                    <span className="text-muted-foreground flex items-center gap-0.5 shrink-0">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                                            <path d="M21 15l-5-5L5 21" />
                                                        </svg>
                                                        <span className="text-xs">{task.photos.length}</span>
                                                    </span>
                                                )}
                                                {task.comments.length > 0 && (
                                                    <span className="text-muted-foreground flex items-center gap-0.5 shrink-0">
                                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                                        </svg>
                                                        <span className="text-xs">{task.comments.length}</span>
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground sm:hidden">{task.tradeName}</span>
                                        </td>
                                        <td className="px-4 py-3 hidden sm:table-cell">
                                            <span className="text-muted-foreground">{task.tradeName}</span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={task.status} size="sm" />
                                        </td>
                                        {onUpdateTaskStatus && (
                                            <td className="px-4 py-3 text-right">
                                                <select
                                                    value={task.status}
                                                    onChange={(e) => onUpdateTaskStatus(task.id, e.target.value as TaskStatus)}
                                                    className="text-xs border border-border rounded-lg px-2 py-1.5 bg-surface text-foreground cursor-pointer"
                                                >
                                                    {(['pending', 'in_progress', 'done', 'blocked'] as TaskStatus[]).map((s) => (
                                                        <option key={s} value={s}>
                                                            {s === 'pending' ? 'Offen' : s === 'in_progress' ? 'In Arbeit' : s === 'done' ? 'Erledigt' : 'Blockiert'}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {tasksWithTrade.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-sm">
                                            Keine Aufgaben gefunden
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {tasksWithTrade.length > 8 && (
                        <div className="px-4 py-3 border-t border-border/40 text-center">
                            <button
                                onClick={() => router.push('/tasks')}
                                className="text-sm text-accent hover:text-accent-light font-medium transition-colors"
                            >
                                +{tasksWithTrade.length - 8} weitere Aufgaben anzeigen
                            </button>
                        </div>
                    )}
                </Card>

                {/* Bottom Grid: Schedule + Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

                    {/* Schedule Section */}
                    <Card>
                        <div className="px-4 py-3 border-b border-border/60 flex items-center justify-between">
                            <h2 className="font-semibold text-foreground">Zeitplan</h2>
                            <span className="text-xs text-muted-foreground">{project.name}</span>
                        </div>
                        <CardContent className="space-y-4">
                            {/* Week Strip */}
                            <div className="flex justify-between gap-1">
                                {weekDays.map((day) => (
                                    <div key={day.label} className="flex flex-col items-center gap-1 flex-1">
                                        <span className="text-[11px] text-muted-foreground font-medium">{day.label}</span>
                                        <span className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                                            day.isToday
                                                ? 'bg-foreground text-background'
                                                : 'text-foreground hover:bg-muted'
                                        }`}>
                                            {day.date.getDate()}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Upcoming Deadlines */}
                            <div className="space-y-2 pt-2">
                                {upcomingDeadlines.length === 0 && (
                                    <p className="text-sm text-muted-foreground py-2">Keine anstehenden Termine</p>
                                )}
                                {upcomingDeadlines.map((trade) => (
                                    <TradeDeadlineItem key={trade.id} trade={trade} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Section */}
                    <Card>
                        <div className="px-4 py-3 border-b border-border/60">
                            <h2 className="font-semibold text-foreground">Letzte Aktivit&auml;t</h2>
                        </div>
                        <CardContent>
                            {activity.length === 0 ? (
                                <p className="text-sm text-muted-foreground py-4 text-center">Noch keine Aktivit&auml;ten</p>
                            ) : (
                                <div className="space-y-0">
                                    {activity.map((item, _idx) => (
                                        <div key={item.id} className="flex gap-3 py-3 border-b border-border/30 last:border-0">
                                            <div className="mt-0.5 shrink-0">
                                                {item.type === 'done' && (
                                                    <div className="w-7 h-7 rounded-full bg-success-muted flex items-center justify-center">
                                                        <svg className="text-success" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {item.type === 'blocked' && (
                                                    <div className="w-7 h-7 rounded-full bg-warning-muted flex items-center justify-center">
                                                        <svg className="text-warning" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                                            <line x1="12" y1="9" x2="12" y2="13" />
                                                            <line x1="12" y1="17" x2="12.01" y2="17" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {item.type === 'photo' && (
                                                    <div className="w-7 h-7 rounded-full bg-info-muted flex items-center justify-center">
                                                        <svg className="text-info" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" />
                                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                                            <path d="M21 15l-5-5L5 21" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {item.type === 'in_progress' && (
                                                    <div className="w-7 h-7 rounded-full bg-info-muted flex items-center justify-center">
                                                        <svg className="text-info" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="9 18 15 12 9 6" />
                                                        </svg>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                                                <p className="text-xs text-muted-foreground truncate">{item.subtitle}</p>
                                            </div>
                                            <span className="text-[11px] text-muted-foreground shrink-0 mt-0.5">
                                                {formatRelativeTime(item.time)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function TradeDeadlineItem({ trade }: { trade: Trade }) {
    const endDate = trade.endDate ? new Date(trade.endDate) : null;
    const startDate = trade.startDate ? new Date(trade.startDate) : null;
    const now = new Date();

    const isStarting = startDate && startDate > now;
    const dateLabel = isStarting
        ? `ab ${formatDate(startDate!)}`
        : endDate
            ? `bis ${formatDate(endDate)}`
            : '';

    const tradeColors = [
        'bg-accent',
        'bg-success',
        'bg-info',
        'bg-warning',
    ];
    const colorClass = tradeColors[trade.order % tradeColors.length];

    return (
        <div className="flex items-center gap-3 py-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${colorClass} shrink-0`} />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{trade.name}</p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{dateLabel}</span>
        </div>
    );
}

function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Gerade';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return formatDate(date);
}
