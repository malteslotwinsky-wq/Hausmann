'use client';

import { useState, useEffect, useRef } from 'react';
import { Photo } from '@/types';

interface PhotoLightboxProps {
    photos: Photo[];
    initialIndex: number;
    isOpen: boolean;
    onClose: () => void;
}

export function PhotoLightbox({ photos, initialIndex, isOpen, onClose }: PhotoLightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);

    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') goToPrevious();
            if (e.key === 'ArrowRight') goToNext();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, photos.length]);

    if (!isOpen || photos.length === 0) return null;

    const currentPhoto = photos[currentIndex];

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = null;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;
        const deltaX = touchEndX.current - touchStartX.current;
        if (Math.abs(deltaX) > 50) {
            if (deltaX < 0) goToNext();
            else goToPrevious();
        }
        touchStartX.current = null;
        touchEndX.current = null;
    };

    return (
        <div className="fixed inset-0 z-[60] bg-black" role="dialog" aria-modal="true" aria-label="Foto-Ansicht">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            >
                <span className="text-2xl">✕</span>
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-medium">
                {currentIndex + 1} / {photos.length}
            </div>

            {/* Navigation Arrows (hidden on mobile) */}
            {photos.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                        <span className="text-3xl">‹</span>
                    </button>
                    <button
                        onClick={goToNext}
                        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-14 h-14 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
                    >
                        <span className="text-3xl">›</span>
                    </button>
                </>
            )}

            {/* Image Container - responsive padding */}
            <div
                className="absolute inset-0 flex items-center justify-center p-2 sm:p-8 lg:p-16"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                <div className="relative max-w-full max-h-full flex items-center justify-center">
                    {currentPhoto.fileUrl && currentPhoto.fileUrl.startsWith('http') ? (
                        <img
                            src={currentPhoto.fileUrl}
                            alt={currentPhoto.caption || 'Foto'}
                            className="max-w-full max-h-full object-contain rounded-lg"
                        />
                    ) : (
                        <div className="bg-gray-800 rounded-lg flex items-center justify-center w-full max-w-[600px] aspect-[3/2]">
                            <svg className="text-gray-600" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="3" width="18" height="18" rx="2" />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <path d="M21 15l-5-5L5 21" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {/* Caption & Info - less top padding on mobile */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 pt-8 sm:p-6 sm:pt-16">
                <div className="max-w-4xl mx-auto">
                    {currentPhoto.caption && (
                        <p className="text-white text-base sm:text-lg mb-2">{currentPhoto.caption}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-white/60">
                        <span>{currentPhoto.uploadedByName || 'Unbekannt'}</span>
                        <span>{new Intl.DateTimeFormat('de-DE').format(currentPhoto.uploadedAt)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${currentPhoto.visibility === 'client'
                                ? 'bg-green-500/30 text-green-300'
                                : 'bg-gray-500/30 text-gray-300'
                            }`}>
                            {currentPhoto.visibility === 'client' ? 'Sichtbar' : 'Intern'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Thumbnails (desktop only) */}
            {photos.length > 1 && (
                <div className="hidden sm:block absolute bottom-28 left-0 right-0 px-4">
                    <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                        {photos.map((photo, idx) => (
                            <button
                                key={photo.id}
                                onClick={() => setCurrentIndex(idx)}
                                className={`w-16 h-16 rounded-lg flex-shrink-0 overflow-hidden border-2 transition-all ${idx === currentIndex
                                        ? 'border-white opacity-100'
                                        : 'border-transparent opacity-50 hover:opacity-75'
                                    }`}
                            >
                                {photo.fileUrl && photo.fileUrl.startsWith('http') ? (
                                    <img src={photo.fileUrl} alt={photo.caption || 'Foto'} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                        <svg className="text-gray-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Dot indicators (mobile only) */}
            {photos.length > 1 && (
                <div className="sm:hidden absolute bottom-24 left-0 right-0 flex justify-center gap-2">
                    {photos.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${
                                idx === currentIndex
                                    ? 'bg-white w-4'
                                    : 'bg-white/40'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
