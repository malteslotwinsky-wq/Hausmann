'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'baulot-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('system');
    const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

    // Initialize theme from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored) {
            setThemeState(stored);
        }
    }, []);

    // Apply theme to document
    useEffect(() => {
        const applyTheme = (isDark: boolean) => {
            if (isDark) {
                document.documentElement.classList.add('dark');
                setResolvedTheme('dark');
            } else {
                document.documentElement.classList.remove('dark');
                setResolvedTheme('light');
            }

            // Update meta theme-color for mobile browsers
            const metaThemeColor = document.querySelector('meta[name="theme-color"]');
            if (metaThemeColor) {
                metaThemeColor.setAttribute('content', isDark ? '#0F172A' : '#F1F5F9');
            }
        };

        if (theme === 'system') {
            // Use system preference
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            applyTheme(mediaQuery.matches);

            const handler = (e: MediaQueryListEvent) => applyTheme(e.matches);
            mediaQuery.addEventListener('change', handler);
            return () => mediaQuery.removeEventListener('change', handler);
        } else {
            applyTheme(theme === 'dark');
        }
    }, [theme]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    };

    const toggleTheme = () => {
        if (resolvedTheme === 'light') {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

/**
 * Theme toggle button component
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-3 rounded-xl bg-muted hover:bg-surface-highlight tap-active transition-all ${className}`}
            aria-label={resolvedTheme === 'light' ? 'Dunkelmodus aktivieren' : 'Hellmodus aktivieren'}
        >
            {resolvedTheme === 'light' ? (
                <span className="text-xl">🌙</span>
            ) : (
                <span className="text-xl">☀️</span>
            )}
        </button>
    );
}

/**
 * Theme selector with all options
 */
export function ThemeSelector() {
    const { theme, setTheme } = useTheme();

    const options: { value: Theme; label: string; icon: string }[] = [
        { value: 'light', label: 'Hell', icon: '☀️' },
        { value: 'dark', label: 'Dunkel', icon: '🌙' },
        { value: 'system', label: 'System', icon: '💻' },
    ];

    return (
        <div className="flex gap-2">
            {options.map((option) => (
                <button
                    key={option.value}
                    onClick={() => setTheme(option.value)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl tap-active transition-all ${theme === option.value
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-surface-highlight'
                        }`}
                >
                    <span>{option.icon}</span>
                    <span className="text-sm font-medium">{option.label}</span>
                </button>
            ))}
        </div>
    );
}
