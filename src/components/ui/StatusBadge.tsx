'use client';

import { TaskStatus } from '@/types';
import { getStatusDisplay } from '@/lib/utils';

interface StatusBadgeProps {
    status: TaskStatus;
    showLabel?: boolean;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, showLabel = true, size = 'md' }: StatusBadgeProps) {
    const { icon, color, label } = getStatusDisplay(status);

    const sizeClasses = size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-3 py-1';

    const bgColors: Record<TaskStatus, string> = {
        pending: 'bg-muted',
        in_progress: 'bg-blue-500/10',
        done: 'bg-green-500/10',
        blocked: 'bg-orange-500/10',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${bgColors[status]} ${color}`}>
            <span className="text-base">{icon}</span>
            {showLabel && <span>{label}</span>}
        </span>
    );
}

interface SimpleStatusBadgeProps {
    status: 'not_started' | 'in_progress' | 'completed';
    showLabel?: boolean;
}

export function SimpleStatusBadge({ status, showLabel = true }: SimpleStatusBadgeProps) {
    const config = {
        not_started: { icon: '○', color: 'text-muted-foreground', bg: 'bg-muted', label: 'Nicht gestartet' },
        in_progress: { icon: '→', color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'In Arbeit' },
        completed: { icon: '✓', color: 'text-green-500', bg: 'bg-green-500/10', label: 'Abgeschlossen' },
    };

    const { icon, color, bg, label } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full text-sm px-3 py-1 font-medium ${bg} ${color}`}>
            <span className="text-base">{icon}</span>
            {showLabel && <span>{label}</span>}
        </span>
    );
}
