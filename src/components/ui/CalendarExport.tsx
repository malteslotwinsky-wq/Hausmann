'use client';

import { addToCalendar, getGoogleCalendarUrl, CalendarEvent, isAndroid } from '@/lib/calendar';

interface CalendarExportButtonProps {
    event: CalendarEvent;
    variant?: 'button' | 'icon' | 'link';
    className?: string;
}

export function CalendarExportButton({
    event,
    variant = 'button',
    className = '',
}: CalendarExportButtonProps) {
    const handleClick = () => {
        addToCalendar(event);
    };

    const handleGoogleClick = () => {
        window.open(getGoogleCalendarUrl(event), '_blank');
    };

    if (variant === 'icon') {
        return (
            <button
                onClick={handleClick}
                className={`p-2 rounded-lg hover:bg-muted transition-colors tap-active ${className}`}
                title="Zum Kalender hinzufügen"
            >
                <span className="text-lg">📅</span>
            </button>
        );
    }

    if (variant === 'link') {
        return (
            <button
                onClick={handleClick}
                className={`text-accent hover:underline tap-active ${className}`}
            >
                📅 Zum Kalender
            </button>
        );
    }

    return (
        <div className={`space-y-2 ${className}`}>
            <button
                onClick={handleClick}
                className="w-full btn-mobile btn-mobile-secondary tap-active flex items-center justify-center gap-2"
            >
                <span>📅</span>
                <span>Zum Kalender hinzufügen</span>
            </button>

            {/* Show Google Calendar option on non-Android devices too */}
            {!isAndroid() && (
                <button
                    onClick={handleGoogleClick}
                    className="w-full text-sm text-muted-foreground hover:text-foreground tap-active py-2"
                >
                    oder in Google Kalender öffnen →
                </button>
            )}
        </div>
    );
}

/**
 * Inline calendar button for use in lists/cards
 */
export function CalendarIconButton({
    event,
    size = 'md',
}: {
    event: CalendarEvent;
    size?: 'sm' | 'md' | 'lg';
}) {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering parent click handlers
        addToCalendar(event);
    };

    const sizeClasses = {
        sm: 'p-1.5 text-sm',
        md: 'p-2 text-base',
        lg: 'p-3 text-lg',
    };

    return (
        <button
            onClick={handleClick}
            className={`rounded-lg bg-accent/10 hover:bg-accent/20 text-accent transition-colors tap-active ${sizeClasses[size]}`}
            title="Zum Kalender hinzufügen"
        >
            📅
        </button>
    );
}
