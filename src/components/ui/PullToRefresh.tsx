'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: ReactNode;
    disabled?: boolean;
}

/**
 * Pull-to-Refresh wrapper component for mobile lists
 */
export function PullToRefresh({
    onRefresh,
    children,
    disabled = false,
}: PullToRefreshProps) {
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);

    const PULL_THRESHOLD = 80;
    const MAX_PULL = 120;

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (disabled || isRefreshing) return;

        // Only activate if at top of scroll
        const container = containerRef.current;
        if (container && container.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, [disabled, isRefreshing]);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling || disabled || isRefreshing) return;

        currentY.current = e.touches[0].clientY;
        const delta = currentY.current - startY.current;

        if (delta > 0) {
            // Apply resistance to make it feel natural
            const resistance = 0.5;
            const adjustedDelta = Math.min(delta * resistance, MAX_PULL);
            setPullDistance(adjustedDelta);

            // Prevent default scrolling when pulling
            if (delta > 10) {
                e.preventDefault();
            }
        }
    }, [isPulling, disabled, isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling || disabled) return;

        setIsPulling(false);

        if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(PULL_THRESHOLD); // Keep indicator visible

            try {
                await onRefresh();
            } catch (error) {
                console.error('Refresh failed:', error);
            }

            setIsRefreshing(false);
        }

        setPullDistance(0);
    }, [isPulling, pullDistance, isRefreshing, onRefresh, disabled]);

    const pullProgress = Math.min(pullDistance / PULL_THRESHOLD, 1);
    const shouldTrigger = pullDistance >= PULL_THRESHOLD;

    return (
        <div
            ref={containerRef}
            className="relative overflow-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            <div
                className="absolute left-0 right-0 flex items-center justify-center pointer-events-none transition-opacity"
                style={{
                    top: -60,
                    height: 60,
                    transform: `translateY(${pullDistance}px)`,
                    opacity: pullProgress,
                }}
            >
                <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-border ${isRefreshing ? 'animate-pulse' : ''
                        }`}
                >
                    <span
                        className={`text-lg transition-transform ${shouldTrigger || isRefreshing ? 'animate-spin' : ''
                            }`}
                        style={{
                            transform: isRefreshing ? undefined : `rotate(${pullProgress * 180}deg)`,
                        }}
                    >
                        {isRefreshing ? '⟳' : '↓'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                        {isRefreshing
                            ? 'Aktualisieren...'
                            : shouldTrigger
                                ? 'Loslassen'
                                : 'Herunterziehen'}
                    </span>
                </div>
            </div>

            {/* Content with pull offset */}
            <div
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: isPulling ? 'none' : 'transform 0.2s ease-out',
                }}
            >
                {children}
            </div>
        </div>
    );
}
