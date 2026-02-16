'use client';

import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';

export default function AGBPage() {
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
                            <h1 className="text-headline text-foreground">Allgemeine Geschäftsbedingungen</h1>
                            <p className="text-sm text-muted-foreground">AGB für BauLot</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-6">
                    {/* Last Updated */}
                    <div className="text-xs text-muted-foreground">
                        Gültig ab: 16. Februar 2026
                    </div>

                    {/* Section 1 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">1. Geltungsbereich und Definitionen</h2>
                        <p className="text-sm text-muted-foreground">
                            Diese Allgemeinen Geschäftsbedingungen (AGB) regeln das Verhältnis zwischen der BauLot GmbH (&quot;Anbieter&quot;) und den Nutzern (&quot;Nutzer&quot;) der BauLot-Anwendung.
                            Durch die Nutzung von BauLot akzeptieren Sie diese AGB in vollem Umfang.
                        </p>
                    </section>

                    {/* Section 2 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">2. Lizenz und Nutzungsrechte</h2>
                        <p className="text-sm text-muted-foreground">
                            Der Anbieter gewährt dem Nutzer eine begrenzte, nicht-exklusive Lizenz zur Nutzung von BauLot für geschäftliche Zwecke.
                            Diese Lizenz wird widerrufen, wenn der Nutzer die AGB verletzt oder die Gebühren nicht bezahlt.
                        </p>
                    </section>

                    {/* Section 3 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">3. Benutzerverantwortung</h2>
                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Der Nutzer ist verantwortlich für:
                            </p>
                            <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                                <li>• Den Schutz des Passworts und Benutzerkontos</li>
                                <li>• Die Genauigkeit der bereitgestellten Informationen</li>
                                <li>• Die legale Verwendung der Anwendung</li>
                                <li>• Die Einhaltung aller geltenden Gesetze</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">4. Verbotene Aktivitäten</h2>
                        <p className="text-sm text-muted-foreground mb-2">
                            Der Nutzer verpflichtet sich, folgende Aktivitäten nicht durchzuführen:
                        </p>
                        <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                            <li>• Missbrauch oder Hacking der Anwendung</li>
                            <li>• Verbreitung von Malware oder schädlichem Code</li>
                            <li>• Unbefugter Zugriff auf Konten anderer Nutzer</li>
                            <li>• Verletzung von Urheberrechten oder geistigen Eigentümer</li>
                        </ul>
                    </section>

                    {/* Section 5 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">5. Serviceunterbrechungen</h2>
                        <p className="text-sm text-muted-foreground">
                            Der Anbieter bemüht sich, den Service verfügbar zu halten, garantiert jedoch keine unterbrechungsfreie Nutzung.
                            Der Anbieter haftet nicht für Ausfallzeiten aufgrund von Wartung, Updates oder technischen Problemen.
                        </p>
                    </section>

                    {/* Section 6 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">6. Daten und Backups</h2>
                        <p className="text-sm text-muted-foreground">
                            Der Nutzer ist verantwortlich für die Erstellung von Backups seiner Daten.
                            Der Anbieter ist nicht verantwortlich für den Verlust von Daten aufgrund von technischen Fehlern oder Verletzungen der Sicherheit.
                        </p>
                    </section>

                    {/* Section 7 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">7. Haftungsbeschränkung</h2>
                        <p className="text-sm text-muted-foreground">
                            Soweit nicht durch Gesetz ausdrücklich erforderlich, haftet der Anbieter nicht für indirekte, zufällige, besondere oder Folgeschäden.
                            Die maximale Haftung des Anbieters ist auf die vom Nutzer gezahlten Gebühren begrenzt.
                        </p>
                    </section>

                    {/* Section 8 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">8. Änderungen und Beendigung</h2>
                        <p className="text-sm text-muted-foreground">
                            Der Anbieter behält sich das Recht vor, diese AGB jederzeit zu ändern.
                            Der Anbieter kann das Nutzerkonto jederzeit beenden, wenn der Nutzer die AGB verletzt.
                        </p>
                    </section>

                    {/* Section 9 */}
                    <section className="space-y-3">
                        <h2 className="text-title font-semibold text-foreground">9. Anwendbares Recht</h2>
                        <p className="text-sm text-muted-foreground">
                            Diese AGB werden nach deutschem Recht ausgelegt und beherrscht.
                            Gerichtsstand ist Berlin, Deutschland.
                        </p>
                    </section>

                    {/* Section 10 */}
                    <section className="space-y-3 border-t border-border pt-6">
                        <h2 className="text-title font-semibold text-foreground">10. Kontakt bei Fragen</h2>
                        <p className="text-sm text-muted-foreground mb-2">
                            Für Fragen zu diesen AGB kontaktieren Sie bitte:
                        </p>
                        <div className="bg-muted p-4 rounded-lg space-y-1">
                            <p className="text-sm font-medium text-foreground">BauLot GmbH</p>
                            <p className="text-sm text-muted-foreground">E-Mail: legal@baulot.de</p>
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
