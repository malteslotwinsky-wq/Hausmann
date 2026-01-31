'use client';

import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { defaultTheme } from '@/lib/branding';

export function LoginScreen() {
    const { login } = useAuth();

    const roles: { role: Role; label: string; description: string; icon: string }[] = [
        {
            role: 'client',
            label: 'BAUHERR',
            description: 'Projektfortschritt verfolgen',
            icon: '→',
        },
        {
            role: 'architect',
            label: 'ARCHITEKT',
            description: 'Projektmanagement',
            icon: '→',
        },
        {
            role: 'contractor',
            label: 'HANDWERKER',
            description: 'Ausführung dokumentieren',
            icon: '→',
        },
    ];

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Left: Branding & Login */}
            <div className="flex flex-col justify-center p-8 lg:p-16 bg-white">
                <div className="max-w-md w-full mx-auto">
                    <div className="mb-12">
                        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">
                            {defaultTheme.name.toUpperCase()}
                        </h1>
                        <p className="text-muted-foreground uppercase tracking-wider text-xs font-medium">
                            Premium Bautagebuch & Management
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm font-medium text-foreground mb-4 uppercase tracking-wide">
                            Zugang wählen
                        </p>
                        {roles.map(({ role, label, description, icon }) => (
                            <button
                                key={role}
                                onClick={() => login(role)}
                                className="w-full group flex items-center justify-between p-6 border border-border hover:border-primary hover:bg-muted transition-all duration-300 text-left rounded-sm"
                            >
                                <div>
                                    <div className="font-bold text-primary tracking-wide text-sm">{label}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{description}</div>
                                </div>
                                <span className="text-muted-foreground group-hover:text-primary transition-colors text-xl font-light">
                                    {icon}
                                </span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-12 pt-8 border-t border-border">
                        <div className="flex justify-between items-center text-xs text-muted-foreground">
                            <span>&copy; 2026 {defaultTheme.name}</span>
                            <span className="uppercase tracking-widest">Secure Client Access</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Architectural Image (Placeholder color for now) */}
            <div className="hidden lg:block bg-zinc-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800 flex items-center justify-center text-zinc-700">
                    <div className="text-center">
                        <span className="text-9xl opacity-10 font-serif">A</span>
                        <p className="mt-4 uppercase tracking-[0.5em] text-sm opacity-30">Architecture & Design</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
