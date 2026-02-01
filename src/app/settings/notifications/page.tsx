'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider, useToast } from '@/components/ui/Toast';

interface NotificationSetting {
    id: string;
    label: string;
    description: string;
    enabled: boolean;
}

function NotificationsPageContent() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [emailSettings, setEmailSettings] = useState<NotificationSetting[]>([
        { id: 'email_tasks', label: 'Aufgaben-Updates', description: 'Bei neuen oder geänderten Aufgaben', enabled: true },
        { id: 'email_photos', label: 'Neue Fotos', description: 'Wenn Fotos hochgeladen werden', enabled: true },
        { id: 'email_comments', label: 'Kommentare', description: 'Bei neuen Kommentaren', enabled: false },
        { id: 'email_blocked', label: 'Blockierte Aufgaben', description: 'Bei Behinderungsanzeigen', enabled: true },
        { id: 'email_weekly', label: 'Wochenbericht', description: 'Wöchentliche Zusammenfassung', enabled: true },
    ]);

    const [pushSettings, setPushSettings] = useState<NotificationSetting[]>([
        { id: 'push_tasks', label: 'Aufgaben-Updates', description: 'Bei neuen oder geänderten Aufgaben', enabled: true },
        { id: 'push_photos', label: 'Neue Fotos', description: 'Wenn Fotos hochgeladen werden', enabled: false },
        { id: 'push_comments', label: 'Kommentare', description: 'Bei neuen Kommentaren', enabled: true },
        { id: 'push_blocked', label: 'Blockierte Aufgaben', description: 'Bei Behinderungsanzeigen', enabled: true },
    ]);

    if (status === 'loading' || !session) return null;

    const toggleSetting = (type: 'email' | 'push', id: string) => {
        if (type === 'email') {
            setEmailSettings(prev =>
                prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
            );
        } else {
            setPushSettings(prev =>
                prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
            );
        }
    };

    const handleSave = async () => {
        setLoading(true);
        // In a real app, save these settings to the backend
        await new Promise(resolve => setTimeout(resolve, 500));
        showToast('Einstellungen gespeichert', 'success');
        setLoading(false);
    };

    return (
        <AppShell currentPage="dashboard">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-14 z-30 bg-background/80 backdrop-blur-md border-b border-border px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted tap-active"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-headline text-foreground">Benachrichtigungen</h1>
                            <p className="text-sm text-muted-foreground">E-Mail & Push Einstellungen</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-6">
                    {/* Email Notifications */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-xl">✉️</span>
                            <h2 className="text-caption text-muted-foreground">E-MAIL BENACHRICHTIGUNGEN</h2>
                        </div>

                        <div className="space-y-2">
                            {emailSettings.map((setting) => (
                                <ToggleCard
                                    key={setting.id}
                                    label={setting.label}
                                    description={setting.description}
                                    enabled={setting.enabled}
                                    onToggle={() => toggleSetting('email', setting.id)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Push Notifications */}
                    <section className="space-y-3">
                        <div className="flex items-center gap-2 px-1">
                            <span className="text-xl">🔔</span>
                            <h2 className="text-caption text-muted-foreground">PUSH BENACHRICHTIGUNGEN</h2>
                        </div>

                        <div className="space-y-2">
                            {pushSettings.map((setting) => (
                                <ToggleCard
                                    key={setting.id}
                                    label={setting.label}
                                    description={setting.description}
                                    enabled={setting.enabled}
                                    onToggle={() => toggleSetting('push', setting.id)}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Info */}
                    <div className="card-mobile bg-blue-500/10 border-blue-500/20">
                        <div className="flex gap-3">
                            <span className="text-xl">💡</span>
                            <div className="text-sm text-blue-500">
                                <p className="font-medium mb-1">Push-Benachrichtigungen</p>
                                <p className="text-blue-500/80">
                                    Um Push-Benachrichtigungen zu erhalten, müssen Sie die BauLot-App installieren
                                    und die Benachrichtigungen in Ihren Geräteeinstellungen aktivieren.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full btn-mobile btn-mobile-accent tap-active disabled:opacity-50"
                    >
                        {loading ? 'Speichern...' : 'Änderungen speichern'}
                    </button>
                </div>
            </div>
        </AppShell>
    );
}

function ToggleCard({
    label,
    description,
    enabled,
    onToggle
}: {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
}) {
    return (
        <div
            onClick={onToggle}
            className="card-mobile flex items-center justify-between tap-active cursor-pointer"
        >
            <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div
                className={`w-12 h-7 rounded-full flex items-center transition-colors ${enabled ? 'bg-accent justify-end' : 'bg-border justify-start'
                    }`}
            >
                <div className={`w-5 h-5 bg-white rounded-full shadow-md mx-1 transition-transform`} />
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    return (
        <ToastProvider>
            <NotificationsPageContent />
        </ToastProvider>
    );
}
