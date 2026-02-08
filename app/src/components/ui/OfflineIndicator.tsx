'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect online/offline status
 */
export function useOnlineStatus(): boolean {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

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
    const [wasOffline, setWasOffline] = useState(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            setWasOffline(true);
        } else if (wasOffline) {
            // Show "reconnected" message briefly
            setShowReconnected(true);
            const timer = setTimeout(() => {
                setShowReconnected(false);
                setWasOffline(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isOnline, wasOffline]);

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
