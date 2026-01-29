'use client';

import { useAuth } from '@/context/AuthContext';
import { Role } from '@/types';
import { Button } from '@/components/ui/Button';

export function LoginScreen() {
    const { login } = useAuth();

    const roles: { role: Role; label: string; description: string; icon: string }[] = [
        {
            role: 'client',
            label: 'Kunde',
            description: 'Projektfortschritt verfolgen',
            icon: '🏠',
        },
        {
            role: 'architect',
            label: 'Architekt',
            description: 'Projekte steuern & prüfen',
            icon: '📐',
        },
        {
            role: 'contractor',
            label: 'Handwerker',
            description: 'Arbeiten dokumentieren',
            icon: '🔧',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🏗</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">BauProject Timeline</h1>
                    <p className="text-gray-500 mt-2">Digitales Bautagebuch & Projektübersicht</p>
                </div>

                {/* Role Selection */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Anmelden als:</h2>

                    <div className="space-y-3">
                        {roles.map(({ role, label, description, icon }) => (
                            <button
                                key={role}
                                onClick={() => login(role)}
                                className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl group-hover:bg-blue-100 transition-colors">
                                    {icon}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{label}</div>
                                    <div className="text-sm text-gray-500">{description}</div>
                                </div>
                                <div className="ml-auto text-gray-400 group-hover:text-blue-500 transition-colors">
                                    →
                                </div>
                            </button>
                        ))}
                    </div>

                    <p className="text-xs text-center text-gray-400 mt-6">
                        Demo-Modus: Wähle eine Rolle um die Ansicht zu testen
                    </p>
                </div>
            </div>
        </div>
    );
}
