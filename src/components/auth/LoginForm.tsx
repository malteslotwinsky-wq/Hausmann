'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { defaultTheme } from '@/lib/branding';

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('E-Mail oder Passwort falsch');
                setLoading(false);
                return;
            }

            router.push(callbackUrl);
            router.refresh();
        } catch (err) {
            setError('Anmeldung fehlgeschlagen');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 safe-area-top safe-area-bottom">
            <div className="w-full max-w-md animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ boxShadow: 'var(--shadow-md)' }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18" />
                            <path d="M5 21V7l7-4 7 4v14" />
                            <path d="M9 21v-6h6v6" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{defaultTheme.name}</h1>
                    <p className="text-muted-foreground mt-1 text-sm">Digitale Bauleitung</p>
                </div>

                {/* Login Card */}
                <div className="card-mobile p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
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
                                className="w-full px-4 py-3 rounded-xl border border-border bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base text-foreground placeholder:text-muted-foreground"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Passwort
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-surface focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base text-foreground placeholder:text-muted-foreground"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
                                    aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
                                >
                                    {showPassword ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-error-muted text-error text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-mobile btn-mobile-accent tap-active disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Anmelden...
                                </>
                            ) : (
                                'Anmelden'
                            )}
                        </button>
                    </form>

                    {/* Forgot Password */}
                    <div className="mt-4 text-center">
                        <a
                            href="/reset-password"
                            className="text-sm text-muted-foreground hover:text-accent transition-colors tap-active"
                        >
                            Passwort vergessen?
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                    © 2026 {defaultTheme.name} · DSGVO-konform
                </p>
            </div>
        </div>
    );
}
