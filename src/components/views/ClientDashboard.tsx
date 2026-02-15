'use client';

import { Project } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { CircularProgress } from '@/components/ui/CircularProgress';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SimpleStatusBadge } from '@/components/ui/StatusBadge';
import { CalendarIconButton } from '@/components/ui/CalendarExport';
import { createProjectEvent } from '@/lib/calendar';
import { calculateProjectProgress, getSimplifiedStatus, formatDate, getDaysUntil } from '@/lib/utils';

interface ClientDashboardProps {
    project: Project;
}

export function ClientDashboard({ project }: ClientDashboardProps) {
    const progress = calculateProjectProgress(project);
    const daysRemaining = getDaysUntil(project.targetEndDate);

    // Create calendar event for the project
    const projectCalendarEvent = createProjectEvent(
        project.name,
        project.address,
        new Date(project.startDate),
        new Date(project.targetEndDate)
    );

    return (
        <div className="min-h-screen bg-background safe-area-top">
            {/* === HEADER === */}
            <header className="px-5 pt-6 pb-4 bg-surface border-b border-border">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-caption text-muted-foreground mb-1">MEIN BAUPROJEKT</p>
                        <h1 className="text-headline text-foreground">{project.name}</h1>
                        <p className="text-sm text-muted-foreground mt-1">{project.address}</p>
                    </div>
                    {/* Calendar Export Button */}
                    <CalendarIconButton event={projectCalendarEvent} size="lg" />
                </div>
            </header>

            {/* === MAIN CONTENT === */}
            <main className="px-4 py-6 pb-32 space-y-6 animate-fade-in">
                {/* Hero: Progress Ring */}
                <section className="card-mobile text-center animate-scale-in">
                    <div className="flex justify-center py-4">
                        <CircularProgress
                            percentage={progress.totalPercentage}
                            size={160}
                            strokeWidth={14}
                            color="stroke-accent"
                        />
                    </div>
                    <p className="text-title text-foreground">Gesamtfortschritt</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Fertigstellung: <span className="font-medium">{formatDate(project.targetEndDate)}</span>
                    </p>
                    {daysRemaining > 0 && (
                        <p className="text-sm text-accent font-medium mt-1">
                            Noch {daysRemaining} Tage
                        </p>
                    )}
                </section>

                {/* Trade Progress Cards */}
                <section>
                    <h2 className="text-caption text-muted-foreground mb-3 px-1">GEWERKE</h2>
                    <div className="space-y-3">
                        {progress.trades.map((trade, index) => {
                            const simpleStatus = getSimplifiedStatus(trade);
                            return (
                                <div
                                    key={trade.tradeId}
                                    className="card-mobile card-mobile-interactive tap-active"
                                    style={{ animationDelay: `${index * 40}ms` }}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="font-medium text-foreground">{trade.tradeName}</span>
                                        <SimpleStatusBadge status={simpleStatus} showLabel={false} />
                                    </div>
                                    <ProgressBar percentage={trade.percentage} size="sm" />
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Construction Diary Preview */}
                <section>
                    <div className="flex items-center justify-between mb-3 px-1">
                        <h2 className="text-caption text-muted-foreground">BAUTAGEBUCH</h2>
                        <button className="text-sm text-accent font-medium tap-active px-2 py-1 -mr-2 rounded-lg">
                            PDF Export →
                        </button>
                    </div>
                    <div className="card-mobile">
                        <DiaryPreview project={project} />
                    </div>
                </section>

                {/* Photo Gallery Preview */}
                <section>
                    <h2 className="text-caption text-muted-foreground mb-3 px-1">DIGITALES BAUTAGEBUCH</h2>
                    <PhotoGalleryPreview project={project} />
                </section>
            </main>
        </div>
    );
}

function DiaryPreview({ project }: { project: Project }) {
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

    const sorted = recentActivities
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

    if (sorted.length === 0) {
        return <p className="text-muted-foreground text-sm text-center py-4">Noch keine Einträge</p>;
    }

    return (
        <div className="space-y-4">
            {sorted.map((activity, idx) => (
                <div key={idx} className="flex items-start gap-3">
                    <span className="text-xs text-muted-foreground min-w-[3.5rem] pt-0.5">
                        {formatDate(activity.date)}
                    </span>
                    <div className="flex-1">
                        <span className="font-medium text-foreground">{activity.trade}</span>
                        <p className="text-sm text-muted-foreground">{activity.task}</p>
                    </div>
                    {activity.type === 'photo' && (
                        <svg className="text-accent shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    )}
                </div>
            ))}
        </div>
    );
}

function PhotoGalleryPreview({ project }: { project: Project }) {
    const allPhotos = project.trades.flatMap(trade =>
        trade.tasks.flatMap(task =>
            task.photos.filter(p => p.visibility === 'client')
        )
    ).slice(0, 6);

    if (allPhotos.length === 0) {
        return (
            <div className="card-mobile text-center py-8">
                <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="text-muted-foreground" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
                <p className="text-muted-foreground text-sm">Noch keine Fotos</p>
            </div>
        );
    }

    return (
        <div className="scroll-snap-x flex gap-3 -mx-4 px-4">
            {allPhotos.map((photo, idx) => (
                <div
                    key={photo.id}
                    className="scroll-snap-item flex-shrink-0 w-32 h-32 bg-muted rounded-xl overflow-hidden tap-active"
                >
                    {/* Placeholder - would be actual image */}
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-border">
                        <svg className="text-muted-foreground" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                    </div>
                </div>
            ))}
        </div>
    );
}
