'use client';

import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
                        <span className="text-4xl">🏗</span>
                    </div>
                    <p className="text-gray-500">Laden...</p>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
