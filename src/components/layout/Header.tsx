'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Role, Project } from '@/types';
import { ProfileDropdown } from '@/components/ui/ProfileDropdown';
import { BauLotIcon } from '@/components/ui/Logo';
import { useProjectContext } from '@/lib/ProjectContext';

interface SearchResult {
    type: 'project' | 'trade' | 'task';
    label: string;
    subtitle: string;
    href: string;
    projectId: string;
}

export function Header() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const [showProfileDropdown, setShowProfileDropdown] = useState(false);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const { selectedProjectId, setSelectedProjectId } = useProjectContext();
    const projectDropdownRef = useRef<HTMLDivElement>(null);

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (session) {
            fetch('/api/projects')
                .then(res => res.ok ? res.json() : [])
                .then((data: Project[]) => {
                    setProjects(data);
                    if (!selectedProjectId && data.length > 0) {
                        setSelectedProjectId(data[0].id);
                    }
                })
                .catch(() => {});
        }
    }, [session, selectedProjectId, setSelectedProjectId]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
                setShowProjectDropdown(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearchResults(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    // Keyboard shortcut: Cmd/Ctrl+K to focus search
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setShowSearchResults(false);
                searchInputRef.current?.blur();
            }
        }
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Build search results
    const searchResults = useMemo((): SearchResult[] => {
        const q = searchQuery.trim().toLowerCase();
        if (q.length < 2) return [];

        const results: SearchResult[] = [];

        for (const project of projects) {
            // Search projects
            if (project.name.toLowerCase().includes(q) || project.address?.toLowerCase().includes(q)) {
                results.push({
                    type: 'project',
                    label: project.name,
                    subtitle: project.address || 'Projekt',
                    href: '/dashboard',
                    projectId: project.id,
                });
            }

            // Search trades
            for (const trade of project.trades || []) {
                if (trade.name.toLowerCase().includes(q) || trade.companyName?.toLowerCase().includes(q)) {
                    results.push({
                        type: 'trade',
                        label: trade.name,
                        subtitle: `${project.name}${trade.companyName ? ` · ${trade.companyName}` : ''}`,
                        href: '/dashboard',
                        projectId: project.id,
                    });
                }

                // Search tasks
                for (const task of trade.tasks || []) {
                    if (task.title.toLowerCase().includes(q) || task.description?.toLowerCase().includes(q)) {
                        results.push({
                            type: 'task',
                            label: task.title,
                            subtitle: `${trade.name} · ${project.name}`,
                            href: '/tasks',
                            projectId: project.id,
                        });
                    }
                }
            }
        }

        return results.slice(0, 8);
    }, [searchQuery, projects]);

    const handleResultClick = useCallback((result: SearchResult) => {
        setSelectedProjectId(result.projectId);
        setSearchQuery('');
        setShowSearchResults(false);
        router.push(result.href);
    }, [setSelectedProjectId, router]);

    if (!session) return null;

    const user = session.user;
    const role = user.role as Role;

    const roleLabels = {
        client: 'Bauherr',
        architect: 'Bauleitung',
        contractor: 'Handwerker',
    };

    const getPageTitle = () => {
        if (pathname?.includes('/dashboard')) return 'Dashboard';
        if (pathname?.includes('/tasks')) return 'Aufgaben';
        if (pathname?.includes('/photos')) return 'Fotos';
        if (pathname?.includes('/diary')) return 'Bautagebuch';
        if (pathname?.includes('/contacts')) return 'Kontakte';
        if (pathname?.includes('/activity')) return 'Aktivität';
        if (pathname?.includes('/admin')) return 'Verwaltung';
        if (pathname?.includes('/settings')) return 'Einstellungen';
        return 'Dashboard';
    };

    const currentProject = projects.find(p => p.id === selectedProjectId) || projects[0];

    const typeIcons: Record<string, string> = {
        project: 'P',
        trade: 'G',
        task: 'A',
    };

    const typeColors: Record<string, string> = {
        project: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
        trade: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
        task: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    };

    return (
        <header className="sticky top-0 z-40 bg-surface/70 backdrop-blur-xl border-b border-border h-14 lg:ml-56 transition-colors duration-200">
            <div className="h-full px-4 lg:px-6 flex items-center justify-between">
                {/* Left: Page Title */}
                <div className="flex items-center gap-3">
                    {/* Mobile Logo */}
                    <Link href="/dashboard" className="lg:hidden flex items-center gap-2">
                        <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-accent-foreground">
                            <BauLotIcon size={16} />
                        </div>
                    </Link>
                    <h2 className="text-[15px] font-semibold text-foreground hidden sm:block">{getPageTitle()}</h2>
                    <span className="text-[11px] text-muted-foreground bg-muted px-2 py-0.5 rounded-md hidden sm:inline font-medium">
                        {roleLabels[role]}
                    </span>
                </div>

                {/* Right: Search + Project Switcher + User Actions */}
                <div className="flex items-center gap-1.5 sm:gap-3">
                    {/* Search */}
                    <div className="relative" ref={searchRef}>
                        <div className="relative">
                            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSearchResults(true);
                                }}
                                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                                placeholder="Suchen..."
                                aria-label="Projekte, Gewerke und Aufgaben durchsuchen"
                                className="w-28 sm:w-44 lg:w-56 pl-8 pr-8 py-1.5 rounded-lg bg-muted border border-transparent focus:border-accent focus:ring-1 focus:ring-accent/20 text-sm text-foreground placeholder:text-muted-foreground outline-none transition-all"
                            />
                            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:inline-flex items-center px-1.5 py-0.5 text-[10px] text-muted-foreground bg-surface border border-border rounded font-mono">
                                ⌘K
                            </kbd>
                        </div>

                        {/* Search Results Dropdown */}
                        {showSearchResults && searchQuery.length >= 2 && (
                            <div className="absolute right-0 sm:left-0 top-full mt-1 w-72 sm:w-80 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50">
                                {searchResults.length > 0 ? (
                                    <div className="py-1 max-h-80 overflow-y-auto overscroll-contain">
                                        {searchResults.map((result, i) => (
                                            <button
                                                key={`${result.type}-${result.label}-${i}`}
                                                onClick={() => handleResultClick(result)}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors"
                                            >
                                                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${typeColors[result.type]}`}>
                                                    {typeIcons[result.type]}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-foreground truncate">{result.label}</p>
                                                    <p className="text-[11px] text-muted-foreground truncate">{result.subtitle}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="px-4 py-6 text-center">
                                        <p className="text-sm text-muted-foreground">Keine Ergebnisse</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Project Switcher */}
                    {projects.length > 0 && (
                        <div className="relative" ref={projectDropdownRef}>
                            <button
                                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-sm max-w-[180px]"
                            >
                                <BauLotIcon size={14} className="text-muted-foreground shrink-0" />
                                <span className="truncate text-foreground font-medium">{currentProject?.name || 'Projekt'}</span>
                                {projects.length > 1 && (
                                    <svg className="text-muted-foreground shrink-0" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9" />
                                    </svg>
                                )}
                            </button>

                            {showProjectDropdown && projects.length > 1 && (
                                <div className="absolute right-0 top-full mt-1 w-64 bg-surface border border-border rounded-xl shadow-lg overflow-hidden z-50">
                                    <div className="py-1">
                                        {projects.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => {
                                                    setSelectedProjectId(p.id);
                                                    setShowProjectDropdown(false);
                                                }}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                                                    p.id === selectedProjectId
                                                        ? 'bg-accent/10 text-accent font-medium'
                                                        : 'text-foreground hover:bg-muted'
                                                }`}
                                            >
                                                {p.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Notification Bell */}
                    <Link
                        href="/settings/notifications"
                        aria-label="Benachrichtigungen"
                        className="relative p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors tap-active"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                    </Link>

                    {/* User Avatar with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                            className="flex items-center gap-2 sm:gap-3 p-1.5 -m-1.5 rounded-xl hover:bg-muted transition-colors tap-active"
                        >
                            <div className="w-8 h-8 bg-accent/10 text-accent rounded-full flex items-center justify-center font-semibold text-sm ring-1 ring-accent/20 hover:ring-accent/30 transition-all">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-foreground leading-tight">{user.name}</p>
                                <p className="text-[11px] text-muted-foreground">{roleLabels[role]}</p>
                            </div>
                            <svg className="hidden sm:block text-muted-foreground" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9" />
                            </svg>
                        </button>

                        {/* Profile Dropdown */}
                        <ProfileDropdown
                            isOpen={showProfileDropdown}
                            onClose={() => setShowProfileDropdown(false)}
                            userName={user.name || 'Benutzer'}
                            userEmail={user.email || undefined}
                            userRole={role}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}
