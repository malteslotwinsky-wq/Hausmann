'use client';

import { Project, Role } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { formatDate, formatTime } from '@/lib/utils';

interface ActivityFeedProps {
    project: Project;
    role: Role;
}

interface ActivityItem {
    id: string;
    type: 'status' | 'photo' | 'comment' | 'blocked';
    timestamp: Date;
    title: string;
    description: string;
    tradeName: string;
    taskTitle: string;
    author?: string;
    authorRole?: Role;
    isNew?: boolean;
}

export function ActivityFeed({ project, role }: ActivityFeedProps) {
    const activities = generateActivities(project, role);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Aktivitäten</h2>
                <span className="text-sm text-muted-foreground">{activities.length} Einträge</span>
            </div>

            {/* Empty State */}
            {activities.length === 0 && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <span className="text-6xl block mb-4">🔔</span>
                        <p className="text-muted-foreground">Noch keine Aktivitäten</p>
                    </CardContent>
                </Card>
            )}

            {/* Activity List */}
            <div className="space-y-2">
                {activities.map((activity, idx) => (
                    <ActivityCard key={activity.id} activity={activity} showLine={idx < activities.length - 1} />
                ))}
            </div>
        </div>
    );
}

function ActivityCard({ activity, showLine }: { activity: ActivityItem; showLine: boolean }) {
    const typeConfig = {
        status: { icon: '✓', color: 'bg-green-500' },
        photo: { icon: '📷', color: 'bg-blue-500' },
        comment: { icon: '💬', color: 'bg-purple-500' },
        blocked: { icon: '⚠', color: 'bg-orange-500' },
    };

    const config = typeConfig[activity.type];

    return (
        <div className="flex gap-4">
            {/* Timeline */}
            <div className="flex flex-col items-center">
                <div className={`w-10 h-10 ${config.color} rounded-full flex items-center justify-center text-white text-lg shadow-sm border border-border`}>
                    {config.icon}
                </div>
                {showLine && <div className="w-0.5 flex-1 bg-border my-1" />}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
                <Card className={`${activity.isNew ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                    <CardContent className="py-3">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-medium text-foreground">{activity.title}</span>
                                    {activity.isNew && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
                                            NEU
                                        </span>
                                    )}
                                </div>
                                <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground/60">
                                    <span>{activity.tradeName}</span>
                                    <span>·</span>
                                    <span className="truncate">{activity.taskTitle}</span>
                                </div>
                            </div>
                            <div className="text-right text-xs text-muted-foreground/60 whitespace-nowrap ml-4">
                                <p>{formatDate(activity.timestamp)}</p>
                                <p>{formatTime(activity.timestamp)}</p>
                            </div>
                        </div>
                        {activity.author && (
                            <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                                von <span className="font-medium text-foreground">{activity.author}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function generateActivities(project: Project, role: Role): ActivityItem[] {
    const activities: ActivityItem[] = [];
    const now = new Date();

    project.trades.forEach(trade => {
        // Skip trades not assigned to contractor (if contractor role)
        if (role === 'contractor') {
            // In real app, filter by contractor assignment
        }

        trade.tasks.forEach(task => {
            // Status changes
            if (task.status === 'done') {
                activities.push({
                    id: `done-${task.id}`,
                    type: 'status',
                    timestamp: task.updatedAt,
                    title: 'Aufgabe erledigt',
                    description: `"${task.title}" wurde abgeschlossen`,
                    tradeName: trade.name,
                    taskTitle: task.title,
                    isNew: isWithinHours(task.updatedAt, 24),
                });
            }

            if (task.status === 'in_progress') {
                activities.push({
                    id: `progress-${task.id}`,
                    type: 'status',
                    timestamp: task.updatedAt,
                    title: 'Arbeit begonnen',
                    description: `"${task.title}" ist jetzt in Bearbeitung`,
                    tradeName: trade.name,
                    taskTitle: task.title,
                    isNew: isWithinHours(task.updatedAt, 24),
                });
            }

            if (task.status === 'blocked') {
                activities.push({
                    id: `blocked-${task.id}`,
                    type: 'blocked',
                    timestamp: task.updatedAt,
                    title: 'Problem gemeldet',
                    description: task.blockedReason || 'Aufgabe ist blockiert',
                    tradeName: trade.name,
                    taskTitle: task.title,
                    isNew: isWithinHours(task.updatedAt, 24),
                });
            }

            // Photos
            task.photos
                .filter(p => role !== 'client' || p.visibility === 'client')
                .forEach(photo => {
                    activities.push({
                        id: `photo-${photo.id}`,
                        type: 'photo',
                        timestamp: photo.uploadedAt,
                        title: 'Foto hochgeladen',
                        description: photo.caption || 'Neues Foto dokumentiert',
                        tradeName: trade.name,
                        taskTitle: task.title,
                        author: photo.uploadedByName,
                        isNew: isWithinHours(photo.uploadedAt, 24),
                    });
                });

            // Comments
            task.comments
                .filter(c => role !== 'client' || c.visibility === 'client')
                .forEach(comment => {
                    activities.push({
                        id: `comment-${comment.id}`,
                        type: 'comment',
                        timestamp: comment.createdAt,
                        title: 'Neuer Kommentar',
                        description: comment.content.length > 80
                            ? comment.content.substring(0, 80) + '...'
                            : comment.content,
                        tradeName: trade.name,
                        taskTitle: task.title,
                        author: comment.authorName,
                        authorRole: comment.authorRole,
                        isNew: isWithinHours(comment.createdAt, 24),
                    });
                });
        });
    });

    // Sort by timestamp descending
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function isWithinHours(date: Date, hours: number): boolean {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < hours * 60 * 60 * 1000;
}
