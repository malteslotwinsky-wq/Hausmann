'use client';

import { ReactNode, useRef, useState, useEffect, useCallback } from 'react';

interface SwipeableSheetProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    maxHeight?: string;
}

export function SwipeableSheet({
    isOpen,
    onClose,
    title,
    children,
    maxHeight = '90vh'
}: SwipeableSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);
    const [translateY, setTranslateY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const startY = useRef(0);
    const currentY = useRef(0);

    const CLOSE_THRESHOLD = 100; // Pixels to swipe down before closing

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setTranslateY(0);
            setIsClosing(false);
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
            setIsClosing(false);
            setTranslateY(0);
        }, 200);
    }, [onClose]);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Only allow swipe on the handle area or when at top of scroll
        const target = e.target as HTMLElement;
        const isHandle = target.closest('[data-swipe-handle]');
        const scrollContainer = sheetRef.current?.querySelector('[data-scroll-container]');
        const isAtTop = !scrollContainer || scrollContainer.scrollTop === 0;

        if (isHandle || isAtTop) {
            startY.current = e.touches[0].clientY;
            currentY.current = e.touches[0].clientY;
            setIsDragging(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isDragging) return;

        currentY.current = e.touches[0].clientY;
        const deltaY = currentY.current - startY.current;

        // Only allow downward swipe
        if (deltaY > 0) {
            setTranslateY(deltaY);
            // Prevent default when swiping to avoid page scroll
            e.preventDefault();
        }
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;

        setIsDragging(false);

        if (translateY > CLOSE_THRESHOLD) {
            handleClose();
        } else {
            // Snap back
            setTranslateY(0);
        }
    }, [isDragging, translateY, handleClose]);

    if (!isOpen && !isClosing) return null;

    const sheetStyle = {
        maxHeight,
        transform: isClosing
            ? 'translateY(100%)'
            : `translateY(${translateY}px)`,
        transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.32, 0.72, 0, 1)',
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-200 ${isClosing ? 'opacity-0' : 'animate-fade-in'
                    }`}
                onClick={handleClose}
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl safe-area-bottom"
                style={sheetStyle}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {/* Handle */}
                <div
                    data-swipe-handle
                    className="sticky top-0 bg-white pt-3 pb-2 px-6 border-b border-border rounded-t-2xl cursor-grab active:cursor-grabbing"
                >
                    <div className="w-12 h-1.5 bg-border rounded-full mx-auto mb-3 hover:bg-muted-foreground/30 transition-colors" />
                    {title && (
                        <h2 className="text-lg font-bold text-foreground">{title}</h2>
                    )}
                </div>

                {/* Content */}
                <div
                    data-scroll-container
                    className="overflow-y-auto overscroll-contain p-6"
                    style={{ maxHeight: `calc(${maxHeight} - 70px)` }}
                >
                    {children}
                </div>
            </div>
        </>
    );
}
