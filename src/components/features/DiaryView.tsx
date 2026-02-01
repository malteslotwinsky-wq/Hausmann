'use client';

import { Project, Photo, Comment, Task, Trade } from '@/types';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatDiaryDate, formatDate, formatTime } from '@/lib/utils';

interface DiaryViewProps {
    project: Project;
    isClientView?: boolean;
}

interface DiaryEntry {
    date: Date;
    items: DiaryItem[];
}

interface DiaryItem {
    id: string;
    type: 'status_change' | 'photo' | 'comment';
    timestamp: Date;
    tradeName: string;
    taskTitle: string;
    content: string;
    photo?: Photo;
    comment?: Comment;
    newStatus?: string;
}

export function DiaryView({ project, isClientView = false }: DiaryViewProps) {
    // Generate diary entries from project data
    const diaryEntries = generateDiaryEntries(project, isClientView);

    const handleExportPDF = () => {
        // Placeholder for PDF export
        alert('PDF-Export wird generiert...\n\nIn der Produktionsversion würde hier ein PDF mit allen Einträgen erstellt.');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Bautagebuch</h2>
                    <p className="text-sm text-muted-foreground">{project.name}</p>
                </div>
                <Button onClick={handleExportPDF} icon={<span>📄</span>}>
                    PDF Export
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                <Card>
                    <CardContent className="py-4 text-center">
                        <span className="text-2xl font-bold text-foreground">{diaryEntries.length}</span>
                        <p className="text-xs text-muted-foreground">Tage dokumentiert</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4 text-center">
                        <span className="text-2xl font-bold text-blue-600">
                            {diaryEntries.reduce((sum, e) => sum + e.items.filter(i => i.type === 'photo').length, 0)}
                        </span>
                        <p className="text-xs text-muted-foreground">Fotos</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="py-4 text-center">
                        <span className="text-2xl font-bold text-green-600">
                            {diaryEntries.reduce((sum, e) => sum + e.items.filter(i => i.type === 'status_change').length, 0)}
                        </span>
                        <p className="text-xs text-muted-foreground">Statusänderungen</p>
                    </CardContent>
                </Card>
            </div>

            {/* Timeline */}
            {diaryEntries.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <span className="text-6xl block mb-4">📓</span>
                        <p className="text-gray-500">Noch keine Einträge im Bautagebuch</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {diaryEntries.map((entry, idx) => (
                        <div key={idx} className="relative">
                            {/* Date Header */}
                            <div className="sticky top-16 z-10 bg-background py-2 border-b border-border/50 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <h3 className="font-semibold text-foreground">
                                        {formatDiaryDate(entry.date)}
                                    </h3>
                                    <span className="text-xs text-muted-foreground">
                                        {entry.items.length} Einträge
                                    </span>
                                </div>
                            </div>

                            {/* Day's Entries */}
                            <div className="ml-6 border-l-2 border-border pl-6 space-y-4 pt-2 pb-4">
                                {entry.items.map((item) => (
                                    <DiaryItemCard key={item.id} item={item} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function DiaryItemCard({ item }: { item: DiaryItem }) {
    const typeConfig = {
        status_change: { icon: '✓', bgColor: 'bg-green-500/10 text-green-500', iconColor: 'text-green-500' },
        photo: { icon: '📷', bgColor: 'bg-blue-500/10 text-blue-500', iconColor: 'text-blue-500' },
        comment: { icon: '💬', bgColor: 'bg-purple-500/10 text-purple-500', iconColor: 'text-purple-500' },
    };

    const config = typeConfig[item.type];

    return (
        <Card className={`${config.bgColor} border border-border/10`}>
            <CardContent className="py-4">
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-background/50 flex items-center justify-center text-xl`}>
                        {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{item.tradeName}</span>
                            <span className="text-muted-foreground">·</span>
                            <span className="text-sm text-muted-foreground truncate">{item.taskTitle}</span>
                        </div>
                        <p className="text-sm text-foreground/80">{item.content}</p>

                        {/* Photo Preview */}
                        {item.photo && (
                            <div className="mt-3 inline-block">
                                <div className="w-32 h-24 bg-muted rounded-lg flex items-center justify-center text-3xl text-muted-foreground/50">
                                    📷
                                </div>
                                {item.photo.caption && (
                                    <p className="text-xs text-gray-500 mt-1">{item.photo.caption}</p>
                                )}
                            </div>
                        )}

                        {/* Comment Author */}
                        {item.comment && (
                            <p className="text-xs text-muted-foreground mt-2">
                                — {item.comment.authorName}
                            </p>
                        )}

                        <p className="text-xs text-muted-foreground/60 mt-2">
                            {formatTime(item.timestamp)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function generateDiaryEntries(project: Project, isClientView: boolean): DiaryEntry[] {
    const allItems: DiaryItem[] = [];

    project.trades.forEach(trade => {
        trade.tasks.forEach(task => {
            // Add status changes (simplified - in real app would come from audit log)
            if (task.status === 'done') {
                allItems.push({
                    id: `status-${task.id}`,
                    type: 'status_change',
                    timestamp: task.updatedAt,
                    tradeName: trade.name,
                    taskTitle: task.title,
                    content: 'Aufgabe abgeschlossen',
                    newStatus: 'done',
                });
            }

            // Add photos (filtered by visibility if client view)
            task.photos
                .filter(p => !isClientView || p.visibility === 'client')
                .forEach(photo => {
                    allItems.push({
                        id: `photo-${photo.id}`,
                        type: 'photo',
                        timestamp: photo.uploadedAt,
                        tradeName: trade.name,
                        taskTitle: task.title,
                        content: photo.caption || 'Foto hochgeladen',
                        photo,
                    });
                });

            // Add comments (filtered by visibility if client view)
            task.comments
                .filter(c => !isClientView || c.visibility === 'client')
                .forEach(comment => {
                    allItems.push({
                        id: `comment-${comment.id}`,
                        type: 'comment',
                        timestamp: comment.createdAt,
                        tradeName: trade.name,
                        taskTitle: task.title,
                        content: comment.content,
                        comment,
                    });
                });
        });
    });

    // Group by date
    const grouped = new Map<string, DiaryItem[]>();
    allItems.forEach(item => {
        const dateKey = item.timestamp.toISOString().split('T')[0];
        if (!grouped.has(dateKey)) {
            grouped.set(dateKey, []);
        }
        grouped.get(dateKey)!.push(item);
    });

    // Convert to array and sort
    const entries: DiaryEntry[] = Array.from(grouped.entries())
        .map(([dateKey, items]) => ({
            date: new Date(dateKey),
            items: items.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        }))
        .sort((a, b) => b.date.getTime() - a.date.getTime());

    return entries;
}
