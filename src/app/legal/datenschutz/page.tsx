'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function DatenschutzPage() {
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
                            <h1 className="text-headline text-foreground">Datenschutzerklärung</h1>
                            <p className="text-sm text-muted-foreground">Schutz Ihrer Daten</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-6">
                    {/* Last Updated */}
                    <div className="text-xs text-muted-foreground">
                        Zuletzt aktualisiert: 16. Februar 2026
                    </div>

                    {/* Introduction */}
                    <section className="space-y-3">
                        <p className="text-foreground">
                            Die BauLot GmbH (&quot;wir&quot; oder &quot;uns&quot; oder &quot;unser&quot;) betreibt die BauLot-Website und Anwendung.
                            Diese Seite informiert Sie über unsere Richtlinien zur Erfassung, Verwendung und Offenlegung persönlicher Daten,
                            wenn Sie unsere Service nutzen, und die Wahlmöglichkeiten, die Sie bezüglich dieser Daten haben.
                        </p>
                    </section>

                    {/* Data Collection */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">1. Datenerfassung und -verwendung</h2>
                        <div className="space-y-2">
                            <div>
                                <h3 className="font-medium text-foreground mb-1">Persönliche Informationen</h3>
                                <p className="text-sm text-muted-foreground">
                                    Wir erfassen Informationen, die Sie uns freiwillig mitteilen, wie Name, E-Mail-Adresse, Telefonnummer und Unternehmen.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">Nutzungsdaten</h3>
                                <p className="text-sm text-muted-foreground">
                                    Wir erfassen automatisch Informationen über Ihre Nutzung der BauLot-Anwendung, einschließlich Zugriffsprotokolle und IP-Adressen.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-medium text-foreground mb-1">Fotos und Dokumente</h3>
                                <p className="text-sm text-muted-foreground">
                                    Fotos und Dokumentationen, die Sie in BauLot hochladen, werden auf sicheren Servern gespeichert.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Data Protection */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">2. Schutz Ihrer Daten</h2>
                        <p className="text-sm text-muted-foreground">
                            Wir implementieren angemessene technische und organisatorische Maßnahmen, um Ihre persönlichen Daten vor Verlust, Diebstahl und Missbrauch zu schützen.
                            Alle Daten werden verschlüsselt und sicher auf Supabase-Servern gespeichert.
                        </p>
                    </section>

                    {/* Data Sharing */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">3. Weitergabe von Daten</h2>
                        <p className="text-sm text-muted-foreground">
                            Ihre Daten werden nur an Personen weitergegeben, die Sie in Ihrem Projektteam hinzufügen.
                            Wir geben Ihre Daten nicht an Dritte weiter, es sei denn, dies ist zur Einhaltung von Gesetzen erforderlich.
                        </p>
                    </section>

                    {/* User Rights */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">4. Ihre Rechte</h2>
                        <p className="text-sm text-muted-foreground mb-2">
                            Sie haben das Recht:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-2 ml-4">
                            <li>• Ihre persönlichen Daten einzusehen</li>
                            <li>• Ihre Daten zu berichtigen oder zu aktualisieren</li>
                            <li>• Ihre Daten löschen zu lassen</li>
                            <li>• Der Verarbeitung Ihrer Daten zu widersprechen</li>
                        </ul>
                    </section>

                    {/* Cookies */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">5. Cookies und ähnliche Technologien</h2>
                        <p className="text-sm text-muted-foreground">
                            BauLot verwendet Cookies und ähnliche Verfolgungstechnologien, um die Anwendung zu verbessern und Ihre Einstellungen zu speichern.
                        </p>
                    </section>

                    {/* Contact */}
                    <section className="space-y-3 border-t border-border pt-6">
                        <h2 className="text-title font-semibold text-foreground">6. Kontakt</h2>
                        <p className="text-sm text-muted-foreground">
                            Wenn Sie Fragen zu dieser Datenschutzerklärung haben, kontaktieren Sie uns bitte unter:
                        </p>
                        <div className="bg-muted p-4 rounded-lg space-y-1">
                            <p className="text-sm font-medium text-foreground">BauLot GmbH</p>
                            <p className="text-sm text-muted-foreground">E-Mail: datenschutz@baulot.de</p>
                            <p className="text-sm text-muted-foreground">Telefon: +49 30 1234 56789</p>
                        </div>
                    </section>

                    {/* Version Info */}
                    <div className="text-xs text-muted-foreground text-center py-6">
                        BauLot Version 1.0.0
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
