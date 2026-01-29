'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';

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

    // Quick login buttons for demo
    const demoLogins = [
        { email: 'architekt@demo.de', label: 'Architekt', icon: '📐' },
        { email: 'handwerker@demo.de', label: 'Handwerker', icon: '🔧' },
        { email: 'kunde@demo.de', label: 'Kunde', icon: '👤' },
    ];

    const handleDemoLogin = async (demoEmail: string) => {
        setEmail(demoEmail);
        setPassword('demo1234');
        setLoading(true);

        const result = await signIn('credentials', {
            email: demoEmail,
            password: 'demo1234',
            redirect: false,
        });

        if (result?.ok) {
            router.push(callbackUrl);
            router.refresh();
        } else {
            setError('Demo-Login fehlgeschlagen');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl">🏗</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">BauProject Timeline</h1>
                    <p className="text-gray-500 mt-1">Digitales Bautagebuch</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                E-Mail
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@firma.de"
                                required
                                autoComplete="email"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-base"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-base"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
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
                        <Button
                            type="submit"
                            fullWidth
                            disabled={loading}
                            className="py-3 text-base"
                        >
                            {loading ? 'Anmelden...' : 'Anmelden'}
                        </Button>
                    </form>

                    {/* Demo Quick Login */}
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-xs text-gray-400 text-center mb-4">Demo-Schnellzugang</p>
                        <div className="grid grid-cols-3 gap-2">
                            {demoLogins.map(({ email, label, icon }) => (
                                <button
                                    key={email}
                                    onClick={() => handleDemoLogin(email)}
                                    disabled={loading}
                                    className="flex flex-col items-center gap-1 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                >
                                    <span className="text-2xl">{icon}</span>
                                    <span className="text-xs text-gray-600">{label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-400 mt-6">
                    © 2026 BauProject Timeline · Alle Daten werden DSGVO-konform gespeichert
                </p>
            </div>
        </div>
    );
}
