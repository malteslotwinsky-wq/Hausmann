'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
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
                    <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white text-2xl font-bold">B</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground">{defaultTheme.name}</h1>
                    <p className="text-muted-foreground mt-1">Digitale Bauleitung</p>
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
                                className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base"
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
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-border bg-white focus:border-accent focus:ring-2 focus:ring-accent/20 outline-none transition-all text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                                >
                                    {showPassword ? '🙈' : '👁'}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                                <span>⚠</span>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-mobile btn-mobile-accent tap-active disabled:opacity-50"
                        >
                            {loading ? 'Anmelden...' : 'Anmelden'}
                        </button>
                    </form>

                    {/* Forgot Password */}
                    <div className="mt-4 text-center">
                        <button className="text-sm text-muted-foreground hover:text-accent tap-active">
                            Passwort vergessen?
                        </button>
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
