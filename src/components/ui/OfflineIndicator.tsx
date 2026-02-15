'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState(() =>
        typeof navigator !== 'undefined' ? navigator.onLine : true
    );

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return isOnline;
}

/**
 * Offline indicator banner
 */
export function OfflineIndicator() {
    const isOnline = useOnlineStatus();
    const [showReconnected, setShowReconnected] = useState(false);
    const wasOfflineRef = useRef(false);

    const onReconnect = useCallback(() => {
        setShowReconnected(true);
        const timer = setTimeout(() => setShowReconnected(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isOnline) {
            wasOfflineRef.current = true;
        } else if (wasOfflineRef.current) {
            wasOfflineRef.current = false;
            return onReconnect();
        }
    }, [isOnline, onReconnect]);

    if (isOnline && !showReconnected) return null;

    return (
        <div
            className={`fixed top-0 inset-x-0 z-[100] px-4 py-2 text-center text-sm font-medium transition-all duration-300 ${isOnline
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}
            style={{ paddingTop: 'max(8px, env(safe-area-inset-top))' }}
        >
            {isOnline ? (
                <span>✅ Wieder verbunden</span>
            ) : (
                <span>📡 Keine Internetverbindung – Änderungen können nicht gespeichert werden</span>
            )}
        </div>
    );
}
