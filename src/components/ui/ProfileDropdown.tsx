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
            icon: UserIcon,
            label: 'Meine Daten',
            href: '/settings/profile',
            description: 'Profil bearbeiten',
        },
        {
            icon: BellIcon,
            label: 'Benachrichtigungen',
            href: '/settings/notifications',
            description: 'E-Mail & Push Einstellungen',
        },
        ...(userRole === 'contractor' ? [{
            icon: ProjectIcon,
            label: 'Meine Projekte',
            href: '/settings/projects',
            description: 'Projektzuweisungen',
        }] : []),
        {
            icon: HelpIcon,
            label: 'Hilfe & Support',
            href: '/settings/help',
            description: 'FAQ & Kontakt',
        },
    ];

    return (
        <div
            ref={dropdownRef}
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-full mt-2 w-72 bg-surface rounded-2xl border border-border overflow-hidden z-50 animate-dropdown"
            style={{ boxShadow: 'var(--shadow-xl)' }}
        >
            {/* User Info Header */}
            <div className="px-4 py-4 bg-accent-muted border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-accent/10 text-accent rounded-full flex items-center justify-center font-semibold text-lg ring-1 ring-accent/20">
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
            <nav className="py-1.5">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors tap-active"
                        >
                            <span className="w-8 h-8 flex items-center justify-center text-muted-foreground rounded-lg bg-muted">
                                <Icon />
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{item.label}</p>
                                <p className="text-[11px] text-muted-foreground">{item.description}</p>
                            </div>
                            <svg className="text-muted-foreground/50" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </Link>
                    );
                })}
            </nav>

            {/* Logout */}
            <div className="border-t border-border py-1.5">
                <button
                    onClick={() => {
                        onClose();
                        signOut({ callbackUrl: '/' });
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-error-muted transition-colors tap-active text-left"
                >
                    <span className="w-8 h-8 flex items-center justify-center text-error rounded-lg bg-error-muted">
                        <LogoutIcon />
                    </span>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-error">Abmelden</p>
                        <p className="text-[11px] text-muted-foreground">Sitzung beenden</p>
                    </div>
                </button>
            </div>
        </div>
    );
}

// SVG Icons
function UserIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
    );
}

function BellIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function ProjectIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-6h6v6" />
        </svg>
    );
}

function HelpIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
    );
}
