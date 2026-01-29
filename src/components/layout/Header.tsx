'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Role } from '@/types';

export function Header() {
    const { data: session } = useSession();

    if (!session) return null;

    const user = session.user;
    const role = user.role as Role;

    const roleLabels = {
        client: 'Kunde',
        architect: 'Architekt',
        contractor: 'Handwerker',
    };

    const roleColors = {
        client: 'bg-emerald-100 text-emerald-700',
        architect: 'bg-blue-100 text-blue-700',
        contractor: 'bg-amber-100 text-amber-700',
    };

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                        <span className="text-xl">🏗</span>
                    </div>
                    <div className="hidden sm:block">
                        <h1 className="font-bold text-gray-900">BauProject Timeline</h1>
                    </div>
                </Link>

                {/* Right Side */}
                <div className="flex items-center gap-4">
                    {/* Role Badge */}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColors[role]}`}>
                        {roleLabels[role]}
                    </span>

                    {/* User Name */}
                    <span className="hidden sm:block text-sm text-gray-600">
                        {user.name}
                    </span>

                    {/* Logout Button */}
                    <button
                        onClick={() => signOut({ callbackUrl: '/login' })}
                        className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        Abmelden
                    </button>
                </div>
            </div>
        </header>
    );
}
