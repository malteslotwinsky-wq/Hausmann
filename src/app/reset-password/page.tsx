'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { defaultTheme } from '@/lib/branding';
import { BauLotIcon } from '@/components/ui/Logo';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    // State for request form (no token)
    const [email, setEmail] = useState('');
    const [requestSent, setRequestSent] = useState(false);

    // State for reset form (with token)
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetDone, setResetDone] = useState(false);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setRequestSent(true);
            } else {
                const data = await res.json();
                setError(data.error || 'Fehler beim Senden');
            }
        } catch {
            setError('Verbindungsfehler');
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwörter stimmen nicht überein');
            return;
        }

        if (password.length < 8) {
            setError('Passwort muss mindestens 8 Zeichen haben');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (res.ok) {
                setResetDone(true);
            } else {
                setError(data.error || 'Fehler beim Zurücksetzen');
            }
        } catch {
            setError('Verbindungsfehler');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg text-accent-foreground">
                        <BauLotIcon size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{defaultTheme.name}</h1>
                    <p className="text-muted-foreground mt-1">Passwort zurücksetzen</p>
                </div>

                <div className="card-mobile p-6 sm:p-8">
                    {/* No token: Request reset email */}
                    {!token && !requestSent && (
                        <form onSubmit={handleRequestReset} className="space-y-5">
                            <p className="text-sm text-muted-foreground">
                                Geben Sie Ihre E-Mail-Adresse ein. Sie erhalten einen Link zum Zurücksetzen Ihres Passworts.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    E-Mail
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@firma.de"
                                    required
                                    autoComplete="email"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-mobile btn-mobile-accent tap-active disabled:opacity-50"
                            >
                                {loading ? 'Senden...' : 'Link anfordern'}
                            </button>
                        </form>
                    )}

                    {/* Request sent confirmation */}
                    {!token && requestSent && (
                        <div className="text-center space-y-4">
                            <div className="text-4xl">✉️</div>
                            <p className="text-foreground font-medium">E-Mail gesendet</p>
                            <p className="text-sm text-muted-foreground">
                                Falls ein Konto mit dieser Adresse existiert, haben wir einen Link zum Zurücksetzen gesendet. Bitte prüfen Sie auch den Spam-Ordner.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="text-sm text-accent hover:underline"
                            >
                                Zurück zum Login
                            </button>
                        </div>
                    )}

                    {/* Token present: Set new password */}
                    {token && !resetDone && (
                        <form onSubmit={handleResetPassword} className="space-y-5">
                            <p className="text-sm text-muted-foreground">
                                Geben Sie Ihr neues Passwort ein.
                            </p>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Neues Passwort
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Mindestens 8 Zeichen"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Passwort bestätigen
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Passwort wiederholen"
                                    required
                                    minLength={8}
                                    autoComplete="new-password"
                                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base"
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-mobile btn-mobile-accent tap-active disabled:opacity-50"
                            >
                                {loading ? 'Speichern...' : 'Passwort ändern'}
                            </button>
                        </form>
                    )}

                    {/* Reset success */}
                    {token && resetDone && (
                        <div className="text-center space-y-4">
                            <div className="text-4xl">✓</div>
                            <p className="text-foreground font-medium">Passwort geändert</p>
                            <p className="text-sm text-muted-foreground">
                                Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt anmelden.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full btn-mobile btn-mobile-accent tap-active"
                            >
                                Zum Login
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    <button onClick={() => router.push('/login')} className="hover:text-accent">
                        Zurück zum Login
                    </button>
                </p>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-muted-foreground">Laden...</p>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
