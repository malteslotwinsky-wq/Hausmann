'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { Role } from '@/types';

interface ProfileDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userEmail?: string;
    userRole: Role;
}

export function ProfileDropdown({
    isOpen,
    onClose,
    userName,
    userEmail,
    userRole
}: ProfileDropdownProps) {
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside as any);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside as any);
        };
    }, [isOpen, onClose]);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const menuItems = [
        {
            icon: '👤',
            label: 'Meine Daten',
            href: '/settings/profile',
            description: 'Profil bearbeiten',
        },
        {
            icon: '🔔',
            label: 'Benachrichtigungen',
            href: '/settings/notifications',
            description: 'E-Mail & Push Einstellungen',
        },
        ...(userRole === 'contractor' ? [{
            icon: '🏗',
            label: 'Meine Projekte',
            href: '/settings/projects',
            description: 'Projektzuweisungen',
        }] : []),
        {
            icon: '❓',
            label: 'Hilfe & Support',
            href: '/settings/help',
            description: 'FAQ & Kontakt',
        },
    ];

    return (
        <div
            ref={dropdownRef}
            className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-border overflow-hidden z-50 animate-dropdown"
        >
            {/* User Info Header */}
            <div className="px-4 py-4 bg-gradient-to-br from-accent/10 to-accent/5 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{userName}</p>
                        {userEmail && (
                            <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <nav className="py-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors tap-active"
                    >
                        <span className="text-xl w-8 text-center">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.description}</p>
                        </div>
                        <span className="text-muted-foreground">›</span>
                    </Link>
                ))}
            </nav>

            {/* Logout */}
            <div className="border-t border-border py-2">
                <button
                    onClick={() => {
                        onClose();
                        signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center gap-3 px-4 py-3 w-full hover:bg-red-50 transition-colors tap-active text-left"
                >
                    <span className="text-xl w-8 text-center">🚪</span>
                    <div className="flex-1">
                        <p className="font-medium text-red-600">Abmelden</p>
                        <p className="text-xs text-muted-foreground">Sitzung beenden</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
