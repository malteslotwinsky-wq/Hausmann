import { describe, it, expect } from 'vitest';
import {
    calculateTradeProgress,
    calculateProjectProgress,
    getSimplifiedStatus,
    getStatusDisplay,
    getSimplifiedStatusDisplay,
    isVisibleToRole,
    formatDate,
    getDaysUntil,
} from './utils';
import type { Trade, Project } from '@/types';

function makeTrade(overrides: Partial<Trade> = {}): Trade {
    return {
        id: 'trade-1',
        projectId: 'proj-1',
        name: 'Elektro',
        status: 'active',
        order: 1,
        canCreateSubtasks: false,
        tasks: [],
        ...overrides,
    };
}

function makeProject(overrides: Partial<Project> = {}): Project {
    return {
        id: 'proj-1',
        name: 'Testprojekt',
        address: 'Musterstr. 1',
        status: 'active',
        startDate: new Date('2026-01-01'),
        targetEndDate: new Date('2026-12-31'),
        createdAt: new Date(),
        updatedAt: new Date(),
        trades: [],
        photoApprovalMode: 'manual',
        escalationHours: 48,
        ...overrides,
    };
}

describe('calculateTradeProgress', () => {
    it('returns zero progress for empty tasks', () => {
        const result = calculateTradeProgress(makeTrade());
        expect(result.total).toBe(0);
        expect(result.percentage).toBe(0);
    });

    it('calculates 100% when all done', () => {
        const trade = makeTrade({
            tasks: [
                { id: '1', tradeId: 'trade-1', title: 'A', status: 'done', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                { id: '2', tradeId: 'trade-1', title: 'B', status: 'done', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
            ],
        });
        const result = calculateTradeProgress(trade);
        expect(result.percentage).toBe(100);
        expect(result.done).toBe(2);
        expect(result.total).toBe(2);
    });

    it('calculates mixed status correctly', () => {
        const trade = makeTrade({
            tasks: [
                { id: '1', tradeId: 'trade-1', title: 'A', status: 'done', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                { id: '2', tradeId: 'trade-1', title: 'B', status: 'in_progress', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                { id: '3', tradeId: 'trade-1', title: 'C', status: 'blocked', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                { id: '4', tradeId: 'trade-1', title: 'D', status: 'pending', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
            ],
        });
        const result = calculateTradeProgress(trade);
        expect(result.total).toBe(4);
        expect(result.done).toBe(1);
        expect(result.inProgress).toBe(1);
        expect(result.blocked).toBe(1);
        expect(result.open).toBe(1);
        expect(result.percentage).toBe(25);
    });
});

describe('calculateProjectProgress', () => {
    it('returns 0% for project with no trades', () => {
        const result = calculateProjectProgress(makeProject());
        expect(result.totalPercentage).toBe(0);
        expect(result.blockedCount).toBe(0);
    });

    it('averages trade percentages', () => {
        const project = makeProject({
            trades: [
                makeTrade({
                    id: 'a',
                    tasks: [
                        { id: '1', tradeId: 'a', title: 'A', status: 'done', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                    ],
                }),
                makeTrade({
                    id: 'b',
                    tasks: [
                        { id: '2', tradeId: 'b', title: 'B', status: 'pending', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                    ],
                }),
            ],
        });
        const result = calculateProjectProgress(project);
        expect(result.totalPercentage).toBe(50); // (100 + 0) / 2
    });

    it('counts blocked tasks across trades', () => {
        const project = makeProject({
            trades: [
                makeTrade({
                    id: 'a',
                    tasks: [
                        { id: '1', tradeId: 'a', title: 'A', status: 'blocked', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                    ],
                }),
                makeTrade({
                    id: 'b',
                    tasks: [
                        { id: '2', tradeId: 'b', title: 'B', status: 'blocked', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                        { id: '3', tradeId: 'b', title: 'C', status: 'blocked', createdAt: new Date(), updatedAt: new Date(), photos: [], comments: [] },
                    ],
                }),
            ],
        });
        const result = calculateProjectProgress(project);
        expect(result.blockedCount).toBe(3);
    });
});

describe('getSimplifiedStatus', () => {
    it('returns completed when 100%', () => {
        expect(getSimplifiedStatus({ tradeId: 'x', tradeName: 'x', total: 2, done: 2, inProgress: 0, blocked: 0, open: 0, percentage: 100 })).toBe('completed');
    });

    it('returns in_progress when some work done', () => {
        expect(getSimplifiedStatus({ tradeId: 'x', tradeName: 'x', total: 2, done: 1, inProgress: 0, blocked: 0, open: 1, percentage: 50 })).toBe('in_progress');
    });

    it('returns not_started when nothing done', () => {
        expect(getSimplifiedStatus({ tradeId: 'x', tradeName: 'x', total: 2, done: 0, inProgress: 0, blocked: 0, open: 2, percentage: 0 })).toBe('not_started');
    });
});

describe('getStatusDisplay', () => {
    it('maps pending correctly', () => {
        const result = getStatusDisplay('pending');
        expect(result.label).toBe('Offen');
    });

    it('maps in_progress correctly', () => {
        const result = getStatusDisplay('in_progress');
        expect(result.label).toBe('In Arbeit');
    });

    it('maps done correctly', () => {
        const result = getStatusDisplay('done');
        expect(result.label).toBe('Erledigt');
    });

    it('maps blocked correctly', () => {
        const result = getStatusDisplay('blocked');
        expect(result.label).toBe('Blockiert');
    });
});

describe('getSimplifiedStatusDisplay', () => {
    it('maps not_started', () => {
        expect(getSimplifiedStatusDisplay('not_started').label).toBe('Nicht gestartet');
    });

    it('maps in_progress', () => {
        expect(getSimplifiedStatusDisplay('in_progress').label).toBe('In Arbeit');
    });

    it('maps completed', () => {
        expect(getSimplifiedStatusDisplay('completed').label).toBe('Abgeschlossen');
    });
});

describe('isVisibleToRole', () => {
    it('client visibility is visible to all roles', () => {
        expect(isVisibleToRole('client', 'client')).toBe(true);
        expect(isVisibleToRole('client', 'contractor')).toBe(true);
        expect(isVisibleToRole('client', 'architect')).toBe(true);
    });

    it('internal visibility is hidden from clients', () => {
        expect(isVisibleToRole('internal', 'client')).toBe(false);
        expect(isVisibleToRole('internal', 'contractor')).toBe(true);
        expect(isVisibleToRole('internal', 'architect')).toBe(true);
    });
});

describe('formatDate', () => {
    it('formats date in German locale', () => {
        const result = formatDate(new Date('2026-03-15'));
        expect(result).toBe('15.03.2026');
    });
});

describe('getDaysUntil', () => {
    it('returns positive for future date', () => {
        const future = new Date();
        future.setDate(future.getDate() + 10);
        expect(getDaysUntil(future)).toBe(10);
    });

    it('returns negative for past date', () => {
        const past = new Date();
        past.setDate(past.getDate() - 5);
        expect(getDaysUntil(past)).toBeLessThanOrEqual(-4);
    });
});
