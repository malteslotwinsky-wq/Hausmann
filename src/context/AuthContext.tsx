'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { User, Role } from '@/types';
import { demoUsers } from '@/lib/demo-data';

interface AuthContextType {
    user: User | null;
    role: Role | null;
    login: (role: Role) => void;
    logout: () => void;
    switchRole: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);

    const login = (role: Role) => {
        const demoUser = demoUsers.find(u => u.role === role);
        if (demoUser) {
            setUser(demoUser);
        }
    };

    const logout = () => {
        setUser(null);
    };

    const switchRole = (role: Role) => {
        login(role);
    };

    return (
        <AuthContext.Provider value={{
            user,
            role: user?.role ?? null,
            login,
            logout,
            switchRole
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
