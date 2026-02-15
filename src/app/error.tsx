'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('App error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-red-600 dark:text-red-400 text-2xl">!</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                    Etwas ist schiefgelaufen
                </h2>
                <p className="text-muted-foreground mb-6">
                    Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
                </p>
                <button
                    onClick={reset}
                    className="btn-mobile btn-mobile-accent tap-active"
                >
                    Erneut versuchen
                </button>
            </div>
        </div>
    );
}
