import { describe, it, expect } from 'vitest';
import {
    TRADE_TEMPLATES,
    PROJECT_TEMPLATES,
    getTradesForTemplate,
    calculateTradeDates,
    getTradeTemplate,
    getTemplatesByCategory,
} from './trade-templates';

describe('TRADE_TEMPLATES', () => {
    it('has unique IDs', () => {
        const ids = TRADE_TEMPLATES.map(t => t.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all have positive duration', () => {
        for (const t of TRADE_TEMPLATES) {
            expect(t.typicalDurationDays).toBeGreaterThan(0);
        }
    });

    it('all have valid category', () => {
        const validCategories = ['foundation', 'structure', 'interior', 'finishing', 'exterior'];
        for (const t of TRADE_TEMPLATES) {
            expect(validCategories).toContain(t.category);
        }
    });
});

describe('PROJECT_TEMPLATES', () => {
    it('has unique IDs', () => {
        const ids = PROJECT_TEMPLATES.map(t => t.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('all reference existing trade IDs', () => {
        const tradeIds = new Set(TRADE_TEMPLATES.map(t => t.id));
        for (const pt of PROJECT_TEMPLATES) {
            for (const id of pt.tradeIds) {
                expect(tradeIds.has(id)).toBe(true);
            }
        }
    });
});

describe('getTradesForTemplate', () => {
    it('returns trades for neubau_efh', () => {
        const trades = getTradesForTemplate('neubau_efh');
        expect(trades.length).toBeGreaterThan(0);
        expect(trades.every(t => t.id && t.name)).toBe(true);
    });

    it('returns empty array for unknown template', () => {
        expect(getTradesForTemplate('nonexistent')).toEqual([]);
    });

    it('returns correct count for badsanierung', () => {
        const template = PROJECT_TEMPLATES.find(t => t.id === 'baeder')!;
        const trades = getTradesForTemplate('baeder');
        expect(trades.length).toBe(template.tradeIds.length);
    });
});

describe('calculateTradeDates', () => {
    it('returns dates for each trade', () => {
        const trades = getTradesForTemplate('baeder');
        const startDate = new Date('2026-03-01');
        const results = calculateTradeDates(trades, startDate);

        expect(results.length).toBe(trades.length);
        for (const r of results) {
            expect(r.startDate).toBeInstanceOf(Date);
            expect(r.endDate).toBeInstanceOf(Date);
            expect(r.endDate.getTime()).toBeGreaterThan(r.startDate.getTime());
        }
    });

    it('does not mutate the input date', () => {
        const trades = getTradesForTemplate('baeder');
        const startDate = new Date('2026-03-01');
        const originalTime = startDate.getTime();
        calculateTradeDates(trades, startDate);
        expect(startDate.getTime()).toBe(originalTime);
    });

    it('chains trades sequentially', () => {
        const trades = getTradesForTemplate('sanierung');
        const results = calculateTradeDates(trades, new Date('2026-01-01'));

        // Each trade should start at or after the previous one (with overlap)
        for (let i = 1; i < results.length; i++) {
            // Start date of next trade should be >= start date of previous
            expect(results[i].startDate.getTime()).toBeGreaterThanOrEqual(
                results[i - 1].startDate.getTime()
            );
        }
    });

    it('returns empty array for empty input', () => {
        const results = calculateTradeDates([], new Date('2026-01-01'));
        expect(results).toEqual([]);
    });
});

describe('getTradeTemplate', () => {
    it('finds existing template', () => {
        const result = getTradeTemplate('elektro');
        expect(result).toBeDefined();
        expect(result!.name).toBe('Elektroinstallation');
    });

    it('returns undefined for unknown ID', () => {
        expect(getTradeTemplate('nonexistent')).toBeUndefined();
    });
});

describe('getTemplatesByCategory', () => {
    it('returns all categories', () => {
        const categories = getTemplatesByCategory();
        expect(Object.keys(categories).length).toBe(5);
    });

    it('each category has templates', () => {
        const categories = getTemplatesByCategory();
        for (const [, templates] of Object.entries(categories)) {
            expect(templates.length).toBeGreaterThan(0);
        }
    });

    it('total templates across categories equals TRADE_TEMPLATES length', () => {
        const categories = getTemplatesByCategory();
        const total = Object.values(categories).reduce((sum, arr) => sum + arr.length, 0);
        expect(total).toBe(TRADE_TEMPLATES.length);
    });
});
