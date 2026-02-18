import { Project, Trade, TaskStatus, TradeProgress, ProjectProgress, Visibility, Role } from '@/types';

/**
 * Calculate progress for a single trade
 */
export function calculateTradeProgress(trade: Trade): TradeProgress {
    const total = trade.tasks.length;
    if (total === 0) {
        return {
            tradeId: trade.id,
            tradeName: trade.name,
            total: 0,
            done: 0,
            inProgress: 0,
            blocked: 0,
            open: 0,
            percentage: 0,
        };
    }

    const done = trade.tasks.filter(t => t.status === 'done').length;
    const inProgress = trade.tasks.filter(t => t.status === 'in_progress').length;
    const blocked = trade.tasks.filter(t => t.status === 'blocked').length;
    const open = trade.tasks.filter(t => t.status === 'pending').length;

    return {
        tradeId: trade.id,
        tradeName: trade.name,
        total,
        done,
        inProgress,
        blocked,
        open,
        percentage: Math.round((done / total) * 100),
    };
}

/**
 * Calculate progress for entire project
 */
export function calculateProjectProgress(project: Project): ProjectProgress {
    const trades = project.trades.map(calculateTradeProgress);
    const totalPercentage = trades.length > 0
        ? Math.round(trades.reduce((sum, t) => sum + t.percentage, 0) / trades.length)
        : 0;
    const blockedCount = trades.reduce((sum, t) => sum + t.blocked, 0);

    return {
        projectId: project.id,
        trades,
        totalPercentage,
        blockedCount,
    };
}

/**
 * Get simplified status for client view
 */
export function getSimplifiedStatus(progress: TradeProgress): 'not_started' | 'in_progress' | 'completed' {
    if (progress.percentage === 100) return 'completed';
    if (progress.done > 0 || progress.inProgress > 0) return 'in_progress';
    return 'not_started';
}

/**
 * Get status icon & color mapping
 */
export function getStatusDisplay(status: TaskStatus): { icon: string; color: string; label: string } {
    switch (status) {
        case 'pending':
            return { icon: '○', color: 'text-gray-400', label: 'Offen' };
        case 'in_progress':
            return { icon: '→', color: 'text-blue-500', label: 'In Arbeit' };
        case 'done':
            return { icon: '✓', color: 'text-green-600', label: 'Erledigt' };
        case 'blocked':
            return { icon: '⚠', color: 'text-orange-500', label: 'Blockiert' };
    }
}

/**
 * Get simplified status display for client view
 */
export function getSimplifiedStatusDisplay(simpleStatus: 'not_started' | 'in_progress' | 'completed'): { icon: string; color: string; label: string } {
    switch (simpleStatus) {
        case 'not_started':
            return { icon: '○', color: 'text-gray-400', label: 'Nicht gestartet' };
        case 'in_progress':
            return { icon: '→', color: 'text-blue-500', label: 'In Arbeit' };
        case 'completed':
            return { icon: '✓', color: 'text-green-600', label: 'Abgeschlossen' };
    }
}

/**
 * Check if content is visible to a specific role
 */
export function isVisibleToRole(visibility: Visibility, role: Role): boolean {
    if (visibility === 'client') return true; // Client visibility = visible to all
    if (visibility === 'internal') return role !== 'client'; // Internal = not visible to clients
    return false;
}

/**
 * Ensure a value is a Date object (handles ISO strings from JSON)
 */
function toDate(date: Date | string): Date {
    if (date instanceof Date) return date;
    return new Date(date);
}

/**
 * Format date for display (German locale)
 */
export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(toDate(date));
}

/**
 * Format date for diary (German locale, short)
 */
export function formatDiaryDate(date: Date | string): string {
    return new Intl.DateTimeFormat('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(toDate(date));
}

/**
 * Format time
 */
export function formatTime(date: Date | string): string {
    return new Intl.DateTimeFormat('de-DE', {
        hour: '2-digit',
        minute: '2-digit',
    }).format(toDate(date));
}

/**
 * Get days until target date
 */
export function getDaysUntil(targetDate: Date | string): number {
    const now = new Date();
    const diff = toDate(targetDate).getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
