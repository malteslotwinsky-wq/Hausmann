'use client';

import { TaskStatus } from '@/types';
import { getStatusDisplay } from '@/lib/utils';

interface StatusBadgeProps {
    status: TaskStatus;
    showLabel?: boolean;
    size?: 'sm' | 'md';
}

export function StatusBadge({ status, showLabel = true, size = 'md' }: StatusBadgeProps) {
    const { label } = getStatusDisplay(status);

    const sizeClasses = size === 'sm'
        ? 'text-xs px-2 py-0.5'
        : 'text-sm px-2.5 py-1';

    const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';

    const bgColors: Record<TaskStatus, string> = {
        pending: 'bg-muted',
        in_progress: 'bg-info-muted',
        done: 'bg-success-muted',
        blocked: 'bg-warning-muted',
    };

    const dotColors: Record<TaskStatus, string> = {
        pending: 'bg-muted-foreground',
        in_progress: 'bg-info',
        done: 'bg-success',
        blocked: 'bg-warning',
    };

    const textColors: Record<TaskStatus, string> = {
        pending: 'text-muted-foreground',
        in_progress: 'text-info',
        done: 'text-success',
        blocked: 'text-warning',
    };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses} ${bgColors[status]} ${textColors[status]}`}>
            <span className={`${dotSize} rounded-full ${dotColors[status]}`} />
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
        not_started: { color: 'text-muted-foreground', bg: 'bg-muted', dot: 'bg-muted-foreground', label: 'Nicht gestartet' },
        in_progress: { color: 'text-info', bg: 'bg-info-muted', dot: 'bg-info', label: 'In Arbeit' },
        completed: { color: 'text-success', bg: 'bg-success-muted', dot: 'bg-success', label: 'Abgeschlossen' },
    };

    const { color, bg, dot, label } = config[status];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full text-sm px-2.5 py-1 font-medium ${bg} ${color}`}>
            <span className={`w-2 h-2 rounded-full ${dot}`} />
            {showLabel && <span>{label}</span>}
        </span>
    );
}
