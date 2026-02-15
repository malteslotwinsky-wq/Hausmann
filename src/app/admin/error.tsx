'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center">
                <p className="text-muted-foreground mb-4">Fehler beim Laden der Seite</p>
                <button onClick={reset} className="text-accent font-medium tap-active">
                    Erneut versuchen
                </button>
            </div>
        </div>
    );
}
