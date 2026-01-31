'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Role } from '@/types';

interface BottomNavProps {
    currentPage: string;
}

export function BottomNav({ currentPage }: BottomNavProps) {
    const { data: session } = useSession();
    const role = session?.user?.role as Role | undefined;

    const menuItems = [
        { id: 'dashboard', label: 'Home', icon: HomeIcon, href: '/dashboard' },
        { id: 'tasks', label: 'Aufgaben', icon: TasksIcon, href: '/tasks', hideFor: ['client'] as Role[] },
        { id: 'photos', label: 'Fotos', icon: PhotosIcon, href: '/photos' },
        { id: 'contacts', label: 'Kontakte', icon: ContactsIcon, href: '/contacts', hideFor: ['contractor'] as Role[] },
        { id: 'admin', label: 'Admin', icon: AdminIcon, href: '/admin', hideFor: ['client', 'contractor'] as Role[] },
    ];

    const visibleItems = menuItems.filter(item => !role || !item.hideFor?.includes(role));
    const mobileItems = visibleItems.slice(0, 5);

    return (
        <div className="bg-white/95 backdrop-blur-lg border-t border-border safe-area-bottom">
            <div className="flex justify-around items-stretch">
                {mobileItems.map((item) => {
                    const isActive = currentPage === item.id;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`
                                flex flex-col items-center justify-center py-3 px-4 flex-1 tap-active
                                transition-all duration-200
                                ${isActive ? 'text-accent' : 'text-muted-foreground'}
                            `}
                        >
                            <div className={`
                                relative p-1.5 rounded-xl transition-all duration-200
                                ${isActive ? 'bg-accent/10' : ''}
                            `}>
                                <Icon active={isActive} />
                                {/* Activity badge */}
                                {item.id === 'dashboard' && (
                                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-accent rounded-full border-2 border-white"></span>
                                )}
                            </div>
                            <span className={`
                                text-[11px] font-medium mt-1 tracking-wide
                                ${isActive ? 'text-accent' : 'text-muted-foreground'}
                            `}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

// Custom SVG Icons for crisp rendering
function HomeIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
                fill={active ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function TasksIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M9 11L12 14L22 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M21 12V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V5C3 3.89543 3.89543 3 5 3H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill={active ? "currentColor" : "none"}
                fillOpacity={active ? 0.1 : 0}
            />
        </svg>
    );
}

function PhotosIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="2"
                fill={active ? "currentColor" : "none"}
                fillOpacity={active ? 0.1 : 0}
                stroke="currentColor"
                strokeWidth="2"
            />
            <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
            <path
                d="M21 15L16 10L5 21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function ContactsIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle
                cx="12"
                cy="8"
                r="4"
                fill={active ? "currentColor" : "none"}
                fillOpacity={active ? 0.2 : 0}
                stroke="currentColor"
                strokeWidth="2"
            />
            <path
                d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

function AdminIcon({ active }: { active: boolean }) {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M12 2L2 7L12 12L22 7L12 2Z"
                fill={active ? "currentColor" : "none"}
                fillOpacity={active ? 0.15 : 0}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
