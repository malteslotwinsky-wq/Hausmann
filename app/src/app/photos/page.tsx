'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { PhotoLightbox } from '@/components/modals/PhotoLightbox';
import { Project, Photo, Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';

function PhotosPageContent() {
    const { data: session, status } = useSession();
    const role = session?.user?.role as Role | undefined;
    const [filter, setFilter] = useState<'all' | 'client' | 'internal'>('all');
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status !== 'authenticated') return;

        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) throw new Error('Fetch failed');
                const data: Project[] = await res.json();
                setProjects(data);
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [status]);

    if (status === 'loading' || !session || loading) {
        return (
            <AppShell currentPage="photos">
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-muted-foreground">Laden...</div>
                </div>
            </AppShell>
        );
    }

    // Gather all photos
    const allPhotos: (Photo & { tradeName?: string; taskTitle?: string; projectName?: string })[] = [];

    projects.forEach(project => {
        project.trades.forEach(trade => {
            trade.tasks.forEach(task => {
                task.photos.forEach(photo => {
                    if (role === 'client' && photo.visibility !== 'client') return;
                    allPhotos.push({
                        ...photo,
                        tradeName: trade.name,
                        taskTitle: task.title,
                        projectName: project.name,
                    });
                });
            });
        });
    });

    // Apply filter
    const visiblePhotos = allPhotos.filter(photo => {
        if (role === 'client') return true;
        if (filter === 'all') return true;
        return photo.visibility === filter;
    });

    return (
        <AppShell currentPage="photos">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
                    <h1 className="text-headline text-foreground">Fotos</h1>
                    <p className="text-sm text-muted-foreground">
                        {visiblePhotos.length} {role === 'client' ? 'freigegebene' : ''} Fotos
                    </p>
                </header>

                {/* Filter Bar (non-client) */}
                {role !== 'client' && (
                    <div className="sticky top-[73px] z-20 bg-background px-4 py-3 border-b border-border">
                        <div className="flex gap-2 overflow-x-auto">
                            {[
                                { id: 'all', label: 'Alle' },
                                { id: 'client', label: '👁 Öffentlich' },
                                { id: 'internal', label: '🔒 Intern' },
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id as any)}
                                    className={`
                                        px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap tap-active transition-all
                                        ${filter === f.id
                                            ? 'bg-accent text-white'
                                            : 'bg-muted text-muted-foreground'
                                        }
                                    `}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {visiblePhotos.length === 0 && (
                    <div className="text-center py-20 px-4">
                        <span className="text-6xl block mb-4">📷</span>
                        <p className="text-muted-foreground">
                            {filter !== 'all' ? 'Keine Fotos in diesem Filter' : 'Noch keine Fotos vorhanden'}
                        </p>
                    </div>
                )}

                {/* Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1 sm:gap-2 p-1 sm:p-4">
                    {visiblePhotos.map((photo, index) => (
                        <div
                            key={photo.id}
                            onClick={() => setSelectedPhotoIndex(index)}
                            className="
                                group relative aspect-square bg-muted overflow-hidden cursor-pointer
                                tap-active transition-transform active:scale-[0.98]
                            "
                        >
                            {/* Placeholder Image */}
                            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-border">
                                <span className="text-4xl text-muted-foreground/50 group-hover:scale-110 transition-transform duration-300">
                                    📷
                                </span>
                            </div>

                            {/* Visibility Badge (non-client) */}
                            {role !== 'client' && (
                                <div className="absolute top-2 right-2 z-10">
                                    <span className={`
                                        text-[10px] px-2 py-1 rounded-full font-medium shadow-sm
                                        ${photo.visibility === 'client'
                                            ? 'bg-green-500 text-white'
                                            : 'bg-slate-900 text-white'
                                        }
                                    `}>
                                        {photo.visibility === 'client' ? '👁' : '🔒'}
                                    </span>
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200" />

                            {/* Info Badge */}
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-white text-xs font-medium truncate">
                                    {photo.taskTitle || photo.tradeName}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Lightbox */}
                <PhotoLightbox
                    photos={visiblePhotos}
                    initialIndex={selectedPhotoIndex ?? 0}
                    isOpen={selectedPhotoIndex !== null}
                    onClose={() => setSelectedPhotoIndex(null)}
                />
            </div>
        </AppShell>
    );
}

export default function PhotosPage() {
    return (
        <ToastProvider>
            <PhotosPageContent />
        </ToastProvider>
    );
}
