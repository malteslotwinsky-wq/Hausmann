'use client';

import { useSession } from 'next-auth/react';
import { AppShell } from '@/components/layout/AppShell';
import { PhotoGallery } from '@/components/features/PhotoGallery';
import { demoProjects } from '@/lib/demo-data';
import { Photo, Role } from '@/types';
import { ToastProvider } from '@/components/ui/Toast';

function PhotosPageContent() {
    const { data: session, status } = useSession();
    const role = session?.user?.role as Role | undefined;

    if (status === 'loading' || !session) {
        return null; // Middleware handles redirect
    }

    // Gather all photos from accessible projects
    const accessibleProjects = role === 'client' && session.user.projectIds
        ? demoProjects.filter(p => session.user.projectIds?.includes(p.id))
        : demoProjects;

    const allPhotos: (Photo & { tradeName?: string; taskTitle?: string })[] = [];

    accessibleProjects.forEach(project => {
        project.trades.forEach(trade => {
            trade.tasks.forEach(task => {
                task.photos.forEach(photo => {
                    // Clients only see client-visible photos
                    if (role === 'client' && photo.visibility !== 'client') return;
                    allPhotos.push({
                        ...photo,
                        tradeName: trade.name,
                        taskTitle: task.title,
                    });
                });
            });
        });
    });

    return (
        <AppShell currentPage="photos">
            <div className="max-w-6xl mx-auto p-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Fotos</h1>
                    <p className="text-gray-500">
                        {allPhotos.length} {role === 'client' ? 'freigegebene' : ''} Fotos
                    </p>
                </div>
                <PhotoGallery photos={allPhotos} role={role!} />
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
