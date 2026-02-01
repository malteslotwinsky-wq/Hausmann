'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { ToastProvider, useToast } from '@/components/ui/Toast';

function ProfilePageContent() {
    const { data: session, status, update } = useSession();
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        company: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (session?.user) {
            setForm(prev => ({
                ...prev,
                name: session.user.name || '',
                email: session.user.email || '',
                phone: (session.user as any).phone || '',
                company: (session.user as any).company || '',
            }));
        }
    }, [session]);

    if (status === 'loading' || !session) return null;

    const handleSave = async () => {
        if (!form.name || !form.email) {
            showToast('Name und E-Mail sind erforderlich', 'error');
            return;
        }

        if (form.newPassword && form.newPassword !== form.confirmPassword) {
            showToast('Passwörter stimmen nicht überein', 'error');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`/api/users/${session.user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    company: form.company,
                    ...(form.newPassword ? { password: form.newPassword } : {}),
                }),
            });

            if (!res.ok) throw new Error('Fehler beim Speichern');

            // Update session
            await update({
                ...session,
                user: {
                    ...session.user,
                    name: form.name,
                    email: form.email,
                },
            });

            showToast('Profil aktualisiert', 'success');
            setForm(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
        } catch (error) {
            showToast('Fehler beim Speichern', 'error');
        }
        setLoading(false);
    };

    return (
        <AppShell currentPage="dashboard">
            <div className="min-h-screen bg-background pb-32">
                {/* Header */}
                <header className="sticky top-14 z-30 bg-white border-b border-border px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted tap-active"
                        >
                            ←
                        </button>
                        <div>
                            <h1 className="text-headline text-foreground">Meine Daten</h1>
                            <p className="text-sm text-muted-foreground">Profil bearbeiten</p>
                        </div>
                    </div>
                </header>

                <div className="p-4 space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center py-6">
                        <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-white font-bold text-4xl mb-4">
                            {form.name.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <button className="text-accent font-medium tap-active">
                            Foto ändern
                        </button>
                    </div>

                    {/* Personal Info */}
                    <section className="space-y-4">
                        <h2 className="text-caption text-muted-foreground px-1">PERSÖNLICHE DATEN</h2>

                        <div className="space-y-3">
                            <InputField
                                label="Name"
                                value={form.name}
                                onChange={(v) => setForm({ ...form, name: v })}
                                placeholder="Max Mustermann"
                            />
                            <InputField
                                label="E-Mail"
                                type="email"
                                value={form.email}
                                onChange={(v) => setForm({ ...form, email: v })}
                                placeholder="max@beispiel.de"
                            />
                            <InputField
                                label="Telefon"
                                type="tel"
                                value={form.phone}
                                onChange={(v) => setForm({ ...form, phone: v })}
                                placeholder="+49 123 456789"
                            />
                            <InputField
                                label="Firma"
                                value={form.company}
                                onChange={(v) => setForm({ ...form, company: v })}
                                placeholder="Musterfirma GmbH"
                            />
                        </div>
                    </section>

                    {/* Password Change */}
                    <section className="space-y-4">
                        <h2 className="text-caption text-muted-foreground px-1">PASSWORT ÄNDERN</h2>

                        <div className="space-y-3">
                            <InputField
                                label="Aktuelles Passwort"
                                type="password"
                                value={form.currentPassword}
                                onChange={(v) => setForm({ ...form, currentPassword: v })}
                                placeholder="••••••••"
                            />
                            <InputField
                                label="Neues Passwort"
                                type="password"
                                value={form.newPassword}
                                onChange={(v) => setForm({ ...form, newPassword: v })}
                                placeholder="••••••••"
                            />
                            <InputField
                                label="Passwort bestätigen"
                                type="password"
                                value={form.confirmPassword}
                                onChange={(v) => setForm({ ...form, confirmPassword: v })}
                                placeholder="••••••••"
                            />
                        </div>
                    </section>

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

function InputField({
    label,
    value,
    onChange,
    placeholder,
    type = 'text'
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="card-mobile">
            <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none text-base"
            />
        </div>
    );
}

export default function ProfilePage() {
    return (
        <ToastProvider>
            <ProfilePageContent />
        </ToastProvider>
    );
}
