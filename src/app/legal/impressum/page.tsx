'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function ImpressumPage() {
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
                            <h1 className="text-headline text-foreground">Impressum</h1>
                            <p className="text-sm text-muted-foreground">Anbieterkennzeichnung</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-6">
                    {/* Company Info */}
                    <section className="space-y-3 bg-muted p-4 rounded-lg">
                        <h2 className="text-title font-semibold text-foreground">Unternehmensangaben</h2>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p className="font-medium text-foreground">BauLot GmbH</p>
                            <p>Musterstraße 123</p>
                            <p>10115 Berlin</p>
                            <p>Deutschland</p>
                        </div>
                    </section>

                    {/* Contact Info */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Kontaktinformationen</h2>
                        <div className="space-y-2">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Telefon</p>
                                <a href="tel:+4930123456789" className="text-accent tap-active text-sm">
                                    +49 30 1234 56789
                                </a>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">E-Mail</p>
                                <a href="mailto:info@baulot.de" className="text-accent tap-active text-sm">
                                    info@baulot.de
                                </a>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground mb-1">Website</p>
                                <a href="https://baulot.de" className="text-accent tap-active text-sm">
                                    www.baulot.de
                                </a>
                            </div>
                        </div>
                    </section>

                    {/* Business Registration */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Handelsregistereintrag</h2>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Registergericht: Amtsgericht Berlin-Charlottenburg</p>
                            <p>Handelsregisternummer: HRB 123456</p>
                            <p>Geschäftsführer: Max Mustermann</p>
                        </div>
                    </section>

                    {/* Tax Information */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Steuernummer und USt-ID</h2>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>Umsatzsteuer-Identifikationsnummer: DE 123 456 789</p>
                            <p>Steuernummer: 12 123 123 123</p>
                        </div>
                    </section>

                    {/* Responsible for Content */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Verantwortlich für Inhalte</h2>
                        <p className="text-sm text-muted-foreground">
                            Gemäß Medienstaatsvertrag (MStV) ist verantwortlich für die redaktionellen Inhalte:
                        </p>
                        <div className="bg-muted p-4 rounded-lg space-y-1">
                            <p className="text-sm font-medium text-foreground">Max Mustermann</p>
                            <p className="text-sm text-muted-foreground">BauLot GmbH</p>
                            <p className="text-sm text-muted-foreground">Musterstraße 123, 10115 Berlin</p>
                        </div>
                    </section>

                    {/* Liability Notice */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Haftung für Inhalte</h2>
                        <p className="text-sm text-muted-foreground">
                            Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
                            Als Dienstanbieter sind wir nicht verantwortlich für die über unsere Dienste übermittelten oder gespeicherten Inhalte.
                        </p>
                    </section>

                    {/* Haftung für Links */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">Haftung für Links</h2>
                        <p className="text-sm text-muted-foreground">
                            Unsere Website enthält Links zu externen Websites. Auf den Inhalt dieser externen Websites haben wir keinen Einfluss.
                            Daher können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
                        </p>
                    </section>

                    {/* Copyright */}
                    <section className="space-y-3 border-t border-border pt-6">
                        <h2 className="text-title font-semibold text-foreground">Urheberrecht</h2>
                        <p className="text-sm text-muted-foreground">
                            Die Inhalte und Werke auf dieser Website sind urheberrechtlich geschützt.
                            Jede Art der Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedarf der schriftlichen Zustimmung des Autors oder Erstellers.
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
