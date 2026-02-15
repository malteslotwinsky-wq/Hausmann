import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-muted-foreground text-2xl">404</span>
                </div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                    Seite nicht gefunden
                </h2>
                <p className="text-muted-foreground mb-6">
                    Die angeforderte Seite existiert nicht oder wurde verschoben.
                </p>
                <Link
                    href="/dashboard"
                    className="btn-mobile btn-mobile-accent tap-active inline-block"
                >
                    Zum Dashboard
                </Link>
            </div>
        </div>
    );
}
