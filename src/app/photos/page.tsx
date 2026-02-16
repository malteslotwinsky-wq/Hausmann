'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { PhotoLightbox } from '@/components/modals/PhotoLightbox';
import { Project, Photo, Role } from '@/types';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import { useProjectContext } from '@/lib/ProjectContext';
import { useRealtimeSubscription } from '@/lib/realtime';

function PhotosPageContent() {
    const { data: session, status } = useSession();
    const role = session?.user?.role as Role | undefined;
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();
    const { showToast } = useToast();
    const [filter, setFilter] = useState<'all' | 'client' | 'internal'>('all');
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status !== 'authenticated') return;

        async function fetchProjects() {
            try {
                const res = await fetch('/api/projects');
                if (!res.ok) throw new Error('Fetch failed');
                const data: Project[] = await res.json();
                setProjects(data);
                if (!selectedProjectId && data.length > 0) {
                    setSelectedProjectId(data[0].id);
                }
            } catch {
                // silently fail
            } finally {
                setLoading(false);
            }
        }

        fetchProjects();
    }, [status]);

    const project = projects.find(p => p.id === selectedProjectId) || projects[0] || null;

    // Real-time photo updates
    useRealtimeSubscription({
        table: 'photos',
        event: '*',
        onEvent: () => {
            fetch('/api/projects')
                .then(res => res.ok ? res.json() : null)
                .then(data => { if (data) setProjects(data); })
                .catch(() => {});
            showToast('Fotos aktualisiert', 'info');
        },
        enabled: status === 'authenticated',
    });

    const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !project) return;

        // Find first task to attach to (or prompt user)
        const firstTrade = project.trades[0];
        const firstTask = firstTrade?.tasks[0];
        if (!firstTask) {
            showToast('Erstellen Sie zuerst eine Aufgabe', 'error');
            return;
        }

        setUploading(true);
        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('taskId', firstTask.id);
                formData.append('visibility', 'internal');

                const res = await fetch('/api/photos', { method: 'POST', body: formData });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Upload fehlgeschlagen');
                }
            }
            showToast('Foto(s) hochgeladen', 'success');
            // Refresh projects to get updated photos
            const res = await fetch('/api/projects');
            if (res.ok) setProjects(await res.json());
        } catch (error: any) {
            showToast(error.message || 'Fehler beim Hochladen', 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    if (status === 'loading' || !session || loading) {
        return (
            <AppShell currentPage="photos">
                <div className="min-h-screen bg-background flex items-center justify-center">
                    <div className="text-muted-foreground">Laden...</div>
                </div>
            </AppShell>
        );
    }

    // Gather all photos from selected project
    const allPhotos: (Photo & { tradeName?: string; taskTitle?: string; projectName?: string })[] = [];

    if (project) {
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
    }

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
                        {project ? ` - ${project.name}` : ''}
                    </p>
                </header>

                {/* Filter Bar (non-client) */}
                {role !== 'client' && (
                    <div className="sticky top-[73px] z-20 bg-background px-4 py-3 border-b border-border">
                        <div className="flex gap-2 overflow-x-auto">
                            {[
                                { id: 'all', label: 'Alle' },
                                { id: 'client', label: 'Öffentlich' },
                                { id: 'internal', label: 'Intern' },
                            ].map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => setFilter(f.id as any)}
                                    className={`
                                        px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap tap-active transition-all
                                        ${filter === f.id
                                            ? 'bg-accent text-accent-foreground'
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
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg className="text-muted-foreground" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                            </svg>
                        </div>
                        <p className="text-muted-foreground">
                            {filter !== 'all' ? 'Keine Fotos in diesem Filter' : 'Noch keine Fotos vorhanden'}
                        </p>
                        {role !== 'client' && (
                            <p className="text-sm text-muted-foreground mt-2">
                                Laden Sie Fotos über den Button unten rechts hoch
                            </p>
                        )}
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
                            {/* Photo or Placeholder */}
                            {photo.fileUrl && photo.fileUrl.startsWith('http') ? (
                                <img
                                    src={photo.fileUrl}
                                    alt={photo.caption || photo.taskTitle || 'Foto'}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-border">
                                    <svg className="text-muted-foreground/50 group-hover:scale-110 transition-transform duration-300" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="18" height="18" rx="2" />
                                        <circle cx="8.5" cy="8.5" r="1.5" />
                                        <path d="M21 15l-5-5L5 21" />
                                    </svg>
                                </div>
                            )}

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
                                        {photo.visibility === 'client' ? 'Öffentlich' : 'Intern'}
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

                {/* Upload FAB (non-client) */}
                {role !== 'client' && (
                    <>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleUploadPhoto}
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="fixed bottom-24 right-6 w-14 h-14 bg-accent text-accent-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-accent/90 transition-colors z-30 disabled:opacity-50"
                            aria-label="Foto hochladen"
                        >
                            {uploading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            )}
                        </button>
                    </>
                )}

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
