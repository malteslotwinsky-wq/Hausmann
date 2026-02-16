'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function LizenzenPage() {
    const router = useRouter();

    return (
        <AppShell currentPage="settings">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-14 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            aria-label="Zurück"
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted tap-active"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-headline text-foreground">Lizenzen</h1>
                            <p className="text-sm text-muted-foreground">Open Source und Abhängigkeiten</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-6">
                    {/* Introduction */}
                    <section className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            BauLot wird mit den folgenden Open-Source-Biblioteken und Abhängigkeiten erstellt.
                            Wir danken allen Entwicklern für ihre wertvollen Beiträge.
                        </p>
                    </section>

                    {/* Core Dependencies */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Kern-Abhängigkeiten</h2>
                        <div className="space-y-3">
                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">Next.js</h3>
                                <p className="text-xs text-muted-foreground mb-2">MIT License</p>
                                <p className="text-xs text-muted-foreground">
                                    React Framework für Produktion mit Server-Rendering und statischer Site-Generierung.
                                </p>
                            </div>

                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">React</h3>
                                <p className="text-xs text-muted-foreground mb-2">MIT License</p>
                                <p className="text-xs text-muted-foreground">
                                    JavaScript-Bibliothek für den Aufbau von Benutzeroberflächen mit Komponenten.
                                </p>
                            </div>

                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">TypeScript</h3>
                                <p className="text-xs text-muted-foreground mb-2">Apache 2.0 License</p>
                                <p className="text-xs text-muted-foreground">
                                    Typsicherer JavaScript für skalierbare Anwendungsentwicklung.
                                </p>
                            </div>

                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">Tailwind CSS</h3>
                                <p className="text-xs text-muted-foreground mb-2">MIT License</p>
                                <p className="text-xs text-muted-foreground">
                                    Utility-First CSS Framework für schnelle Entwicklung von modernen Designs.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Backend */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Backend und Authentifizierung</h2>
                        <div className="space-y-3">
                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">NextAuth.js</h3>
                                <p className="text-xs text-muted-foreground mb-2">ISC License</p>
                                <p className="text-xs text-muted-foreground">
                                    Authentifizierungslösung für Next.js mit JWT und Session-Support.
                                </p>
                            </div>

                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">Supabase</h3>
                                <p className="text-xs text-muted-foreground mb-2">Apache 2.0 License</p>
                                <p className="text-xs text-muted-foreground">
                                    Open-Source Firebase-Alternative mit PostgreSQL-Datenbank.
                                </p>
                            </div>

                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">Zod</h3>
                                <p className="text-xs text-muted-foreground mb-2">MIT License</p>
                                <p className="text-xs text-muted-foreground">
                                    TypeScript-First Schema-Validierung und Datentransformation.
                                </p>
                            </div>

                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">bcryptjs</h3>
                                <p className="text-xs text-muted-foreground mb-2">MIT License</p>
                                <p className="text-xs text-muted-foreground">
                                    Sichere Passwort-Hashing-Bibliothek für Node.js.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Testing */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Testing und Entwicklung</h2>
                        <div className="space-y-3">
                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">Vitest</h3>
                                <p className="text-xs text-muted-foreground mb-2">MIT License</p>
                                <p className="text-xs text-muted-foreground">
                                    Schnelles Unit-Test-Framework mit Vite-Unterstützung.
                                </p>
                            </div>

                            <div className="bg-muted p-3 rounded-lg">
                                <h3 className="font-medium text-foreground mb-1">ESLint</h3>
                                <p className="text-xs text-muted-foreground mb-2">MIT License</p>
                                <p className="text-xs text-muted-foreground">
                                    Linting-Tool für JavaScript und TypeScript.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* License Info */}
                    <section className="space-y-3 border-t border-border pt-6">
                        <h2 className="text-title font-semibold text-foreground">BauLot Lizenz</h2>
                        <p className="text-sm text-muted-foreground">
                            Die BauLot-Anwendung selbst ist proprietär und urheberrechtlich geschützt.
                            Die Verwendung ist nur mit Zustimmung der BauLot GmbH gestattet.
                        </p>
                    </section>

                    {/* Attribution */}
                    <section className="space-y-3 border-t border-border pt-6">
                        <h2 className="text-title font-semibold text-foreground">Vollständige Lizenzen</h2>
                        <p className="text-sm text-muted-foreground">
                            Alle Lizenzen sind in der package.json und den entsprechenden Paketrepository dokumentiert.
                            Eine vollständige Liste aller verwendeten Abhängigkeiten können Sie durch Ausführung von &quot;npm list&quot; erhalten.
                        </p>
                    </section>

                    {/* Version Info */}
                    <div className="text-xs text-muted-foreground text-center py-6">
                        BauLot Version 1.0.0 | Stand: 16. Februar 2026
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
