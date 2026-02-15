'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Role } from '@/types';
import { defaultTheme } from '@/lib/branding';

interface SidebarProps {
    currentPage: string;
}

export function Sidebar({ currentPage }: SidebarProps) {
    const { data: session } = useSession();
    const role = session?.user?.role as Role | undefined;

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, href: '/dashboard' },
        { id: 'tasks', label: 'Aufgaben', icon: TasksIcon, href: '/tasks', hideFor: ['client'] as Role[] },
        { id: 'photos', label: 'Fotos', icon: PhotosIcon, href: '/photos' },
        { id: 'diary', label: 'Bautagebuch', icon: DiaryIcon, href: '/diary' },
        { id: 'contacts', label: 'Kontakte', icon: ContactsIcon, href: '/contacts', hideFor: ['contractor'] as Role[] },
        { id: 'activity', label: 'Aktivität', icon: ActivityIcon, href: '/activity', hideFor: ['client'] as Role[] },
        { id: 'admin', label: 'Verwaltung', icon: AdminIcon, href: '/admin', hideFor: ['client', 'contractor'] as Role[] },
    ];

    const visibleItems = menuItems.filter(item => !role || !item.hideFor?.includes(role));

    return (
        <div className="w-56 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col h-screen fixed left-0 top-0 z-50">
            {/* Logo / Brand */}
            <div className="p-5 border-b border-white/[0.06]">
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shadow-md">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 21h18" />
                            <path d="M5 21V7l7-4 7 4v14" />
                            <path d="M9 21v-6h6v6" />
                        </svg>
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight">{defaultTheme.name}</span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
                {visibleItems.map((item) => {
                    const isActive = currentPage === item.id;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150
                                ${isActive
                                    ? 'bg-white/[0.1] text-white'
                                    : 'text-white/50 hover:bg-white/[0.06] hover:text-white/80'
                                }
                            `}
                        >
                            <span className={`w-5 h-5 flex items-center justify-center ${isActive ? 'text-accent-light' : ''}`}>
                                <Icon active={isActive} />
                            </span>
                            <span>{item.label}</span>
                            {isActive && (
                                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-light" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.06]">
                <div className="text-[11px] text-white/30">
                    <p>{defaultTheme.name}</p>
                    <p className="mt-0.5">Version 3.0</p>
                </div>
            </div>
        </div>
    );
}

// Clean SVG icons
function DashboardIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.15 : 0} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1.5" />
            <rect x="14" y="3" width="7" height="5" rx="1.5" />
            <rect x="3" y="16" width="7" height="5" rx="1.5" />
            <rect x="14" y="12" width="7" height="9" rx="1.5" />
        </svg>
    );
}

function TasksIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.1 : 0} />
        </svg>
    );
}

function PhotosIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.1 : 0} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path d="M21 15l-5-5L5 21" />
        </svg>
    );
}

function DiaryIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.1 : 0} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="11" x2="13" y2="11" />
        </svg>
    );
}

function ContactsIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.1 : 0} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        </svg>
    );
}

function ActivityIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.1 : 0} />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
    );
}

function AdminIcon({ active }: { active: boolean }) {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} fillOpacity={active ? 0.1 : 0} stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1.08z" />
        </svg>
    );
}
