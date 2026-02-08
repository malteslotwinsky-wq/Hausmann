'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

interface FAQItem {
    question: string;
    answer: string;
}

export default function HelpPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const faqs: FAQItem[] = [
        {
            question: 'Wie lade ich Fotos hoch?',
            answer: 'Gehen Sie zur Aufgaben-Seite, wählen Sie eine Aufgabe aus und tippen Sie auf das Kamera-Symbol. Sie können Fotos direkt aufnehmen oder aus Ihrer Galerie auswählen.',
        },
        {
            question: 'Wie melde ich eine Behinderung?',
            answer: 'In der Aufgabenansicht können Sie über den Button "Problem melden" eine Behinderungsanzeige erstellen. Beschreiben Sie das Problem und die Bauleitung wird benachrichtigt.',
        },
        {
            question: 'Wer sieht meine Fotos?',
            answer: 'Standardmäßig sieht nur die Bauleitung Ihre Fotos. Diese kann entscheiden, welche Fotos auch für den Bauherren freigegeben werden.',
        },
        {
            question: 'Wie ändere ich meinen Status einer Aufgabe?',
            answer: 'Tippen Sie auf eine Aufgabe und nutzen Sie die Status-Auswahl am unteren Bildschirmrand. Änderungen werden sofort gespeichert und die Bauleitung wird informiert.',
        },
        {
            question: 'Was passiert bei Verbindungsproblemen?',
            answer: 'BauLot speichert Ihre Änderungen lokal und synchronisiert automatisch, sobald wieder eine Internetverbindung besteht. Ihre Daten gehen nicht verloren.',
        },
        {
            question: 'Wie kann ich mein Passwort zurücksetzen?',
            answer: 'Gehen Sie zu Einstellungen > Meine Daten und nutzen Sie die Passwort-Ändern-Funktion. Alternativ können Sie uns kontaktieren.',
        },
    ];

    if (status === 'loading' || !session) return null;

    return (
        <AppShell currentPage="settings">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-14 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            aria-label="Zurück" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted tap-active"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-headline text-foreground">Hilfe & Support</h1>
                            <p className="text-sm text-muted-foreground">FAQ und Kontakt</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-6">
                    {/* Quick Contact */}
                    <section className="space-y-3">
                        <h2 className="text-caption text-muted-foreground px-1">SCHNELLKONTAKT</h2>

                        <div className="grid grid-cols-2 gap-3">
                            <a
                                href="mailto:support@baulot.de"
                                className="card-mobile text-center py-5 tap-active"
                            >
                                <span className="text-3xl block mb-2">✉️</span>
                                <p className="font-medium text-foreground">E-Mail</p>
                                <p className="text-xs text-muted-foreground">support@baulot.de</p>
                            </a>
                            <a
                                href="tel:+4930123456789"
                                className="card-mobile text-center py-5 tap-active"
                            >
                                <span className="text-3xl block mb-2">📞</span>
                                <p className="font-medium text-foreground">Telefon</p>
                                <p className="text-xs text-muted-foreground">+49 30 1234 56789</p>
                            </a>
                        </div>
                    </section>

                    {/* FAQ */}
                    <section className="space-y-3">
                        <h2 className="text-caption text-muted-foreground px-1">HÄUFIGE FRAGEN</h2>

                        <div className="space-y-2">
                            {faqs.map((faq, index) => (
                                <div key={index} className="card-mobile overflow-hidden">
                                    <button
                                        onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                        className="w-full flex items-center justify-between text-left tap-active"
                                    >
                                        <p className="font-medium text-foreground pr-4">{faq.question}</p>
                                        <span className={`text-muted-foreground transition-transform ${expandedFAQ === index ? 'rotate-180' : ''
                                            }`}>
                                            ▼
                                        </span>
                                    </button>
                                    {expandedFAQ === index && (
                                        <div className="mt-3 pt-3 border-t border-border">
                                            <p className="text-sm text-muted-foreground">{faq.answer}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Legal Links */}
                    <section className="space-y-3">
                        <h2 className="text-caption text-muted-foreground px-1">RECHTLICHES</h2>

                        <div className="card-mobile space-y-0 divide-y divide-border">
                            <a href="#" className="flex items-center justify-between py-3 tap-active">
                                <span className="font-medium text-foreground">Datenschutzerklärung</span>
                                <span className="text-muted-foreground">›</span>
                            </a>
                            <a href="#" className="flex items-center justify-between py-3 tap-active">
                                <span className="font-medium text-foreground">Impressum</span>
                                <span className="text-muted-foreground">›</span>
                            </a>
                            <a href="#" className="flex items-center justify-between py-3 tap-active">
                                <span className="font-medium text-foreground">Allgemeine Geschäftsbedingungen</span>
                                <span className="text-muted-foreground">›</span>
                            </a>
                            <a href="#" className="flex items-center justify-between py-3 tap-active">
                                <span className="font-medium text-foreground">Lizenzen</span>
                                <span className="text-muted-foreground">›</span>
                            </a>
                        </div>
                    </section>

                    {/* App Info */}
                    <div className="text-center py-6 text-muted-foreground text-sm">
                        <p className="font-medium">BauLot</p>
                        <p>Version 1.0.0</p>
                        <p className="mt-2">© 2026 BauLot GmbH</p>
                        <p>Made with ❤️ in Germany</p>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
