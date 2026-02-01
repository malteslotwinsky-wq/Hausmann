'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { ThemeSelector } from '@/components/ui/ThemeProvider';
import { Role } from '@/types';

export default function SettingsPage() {
    const { data: session, status } = useSession();

    if (status === 'loading' || !session) return null;

    const role = session.user.role as Role;

    const settingsItems = [
        {
            icon: '👤',
            label: 'Meine Daten',
            href: '/settings/profile',
            description: 'Name, E-Mail und Passwort ändern',
            color: 'bg-blue-100 dark:bg-blue-900/30',
        },
        {
            icon: '🔔',
            label: 'Benachrichtigungen',
            href: '/settings/notifications',
            description: 'E-Mail und Push-Einstellungen',
            color: 'bg-amber-100 dark:bg-amber-900/30',
        },
        ...(role === 'contractor' ? [{
            icon: '🏗',
            label: 'Meine Projekte',
            href: '/settings/projects',
            description: 'Projektzuweisungen ansehen',
            color: 'bg-green-100 dark:bg-green-900/30',
        }] : []),
        {
            icon: '❓',
            label: 'Hilfe & Support',
            href: '/settings/help',
            description: 'FAQ und Kontakt',
            color: 'bg-purple-100 dark:bg-purple-900/30',
        },
    ];

    return (
        <AppShell currentPage="dashboard">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-14 z-30 bg-surface border-b border-border px-4 py-4">
                    <h1 className="text-headline text-foreground">Einstellungen</h1>
                    <p className="text-sm text-muted-foreground">Konto und App-Einstellungen</p>
                </header>

                {/* User Card */}
                <div className="p-4">
                    <div className="card-mobile bg-gradient-to-br from-accent/10 to-accent/5">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center text-white font-bold text-2xl">
                                {session.user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-lg text-foreground">{session.user.name}</h2>
                                <p className="text-sm text-muted-foreground truncate">{session.user.email}</p>
                                <span className="inline-block mt-1 text-xs text-accent bg-accent/10 px-2 py-0.5 rounded-full font-medium">
                                    {role === 'architect' ? 'Bauleitung' : role === 'contractor' ? 'Handwerker' : 'Bauherr'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Theme Section */}
                <div className="px-4 mb-6">
                    <h3 className="text-caption text-muted-foreground mb-3">ERSCHEINUNGSBILD</h3>
                    <div className="card-mobile">
                        <p className="text-sm text-muted-foreground mb-3">Wähle dein bevorzugtes Farbschema</p>
                        <ThemeSelector />
                    </div>
                </div>

                {/* Settings List */}
                <div className="px-4 space-y-3">
                    <h3 className="text-caption text-muted-foreground mb-1">KONTO</h3>
                    {settingsItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="card-mobile card-mobile-interactive tap-active flex items-center gap-4"
                        >
                            <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center text-2xl`}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground">{item.label}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <span className="text-muted-foreground text-lg">›</span>
                        </Link>
                    ))}
                </div>

                {/* App Info */}
                <div className="p-4 mt-6">
                    <div className="text-center text-sm text-muted-foreground space-y-1">
                        <p>BauLot Version 1.0.0</p>
                        <p>© 2026 BauLot · Made in Germany 🇩🇪</p>
                        <div className="flex items-center justify-center gap-4 mt-3">
                            <Link href="/settings/help" className="text-accent hover:underline">Datenschutz</Link>
                            <Link href="/settings/help" className="text-accent hover:underline">Impressum</Link>
                            <Link href="/settings/help" className="text-accent hover:underline">AGB</Link>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

