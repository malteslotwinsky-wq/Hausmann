'use client';

import { useState } from 'react';
import { Photo, Role } from '@/types';
import { Card, CardContent } from '@/components/ui/Card';
import { PhotoLightbox } from '@/components/modals/PhotoLightbox';
import { formatDate } from '@/lib/utils';

interface PhotoGalleryProps {
    photos: (Photo & { tradeName?: string; taskTitle?: string })[];
    role: Role;
    onToggleVisibility?: (photoId: string) => void;
}

export function PhotoGallery({ photos, role, onToggleVisibility }: PhotoGalleryProps) {
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
    const [filter, setFilter] = useState<'all' | 'client' | 'internal'>('all');

    // Filter photos based on role and visibility filter
    const visiblePhotos = photos.filter(photo => {
        if (role === 'client') return photo.visibility === 'client';
        if (filter === 'all') return true;
        return photo.visibility === filter;
    });

    const openLightbox = (index: number) => {
        setSelectedPhotoIndex(index);
    };

    const closeLightbox = () => {
        setSelectedPhotoIndex(null);
    };

    return (
        <div>
            {/* Filter Bar (for non-clients) */}
            {role !== 'client' && (
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-gray-500">Filter:</span>
                    {(['all', 'client', 'internal'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${filter === f
                                    ? 'bg-blue-100 text-blue-700'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            {f === 'all' ? 'Alle' : f === 'client' ? '👁 Öffentlich' : '🔒 Intern'}
                        </button>
                    ))}
                    <span className="ml-auto text-sm text-gray-400">{visiblePhotos.length} Fotos</span>
                </div>
            )}

            {/* Empty State */}
            {visiblePhotos.length === 0 && (
                <Card>
                    <CardContent className="py-16 text-center">
                        <span className="text-6xl block mb-4">📷</span>
                        <p className="text-gray-500">Keine Fotos {filter !== 'all' ? 'in diesem Filter' : 'vorhanden'}</p>
                    </CardContent>
                </Card>
            )}

            {/* Photo Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {visiblePhotos.map((photo, index) => (
                    <div
                        key={photo.id}
                        onClick={() => openLightbox(index)}
                        className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
                    >
                        {/* Placeholder Image */}
                        <div className="absolute inset-0 flex items-center justify-center text-5xl text-gray-300 group-hover:scale-110 transition-transform duration-300">
                            📷
                        </div>

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                        {/* Visibility Badge (non-client) */}
                        {role !== 'client' && (
                            <div className="absolute top-2 right-2 z-10">
                                <span className={`text-[10px] px-2 py-1 rounded-full font-medium shadow-sm ${photo.visibility === 'client'
                                        ? 'bg-green-500 text-white'
                                        : 'bg-gray-800 text-white'
                                    }`}>
                                    {photo.visibility === 'client' ? '👁' : '🔒'}
                                </span>
                            </div>
                        )}

                        {/* Info Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                            {photo.taskTitle && (
                                <p className="text-white text-sm font-medium truncate">{photo.taskTitle}</p>
                            )}
                            {photo.tradeName && (
                                <p className="text-white/70 text-xs truncate">{photo.tradeName}</p>
                            )}
                            <p className="text-white/50 text-xs mt-1">{formatDate(photo.uploadedAt)}</p>
                        </div>

                        {/* Hover Zoom Icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <span className="text-white text-3xl drop-shadow-lg">🔍</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            <PhotoLightbox
                photos={visiblePhotos}
                initialIndex={selectedPhotoIndex ?? 0}
                isOpen={selectedPhotoIndex !== null}
                onClose={closeLightbox}
            />
        </div>
    );
}
