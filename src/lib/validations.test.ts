import { describe, it, expect } from 'vitest';
import {
    createProjectSchema,
    updateProjectSchema,
    createTradeSchema,
    updateTradeSchema,
    createUserSchema,
    createTaskSchema,
    updateTaskSchema,
    createMessageSchema,
    paginationSchema,
    uuidParamSchema,
    formatZodError,
} from './validations';

const validUUID = '550e8400-e29b-41d4-a716-446655440000';

describe('createProjectSchema', () => {
    it('accepts valid input', () => {
        const result = createProjectSchema.safeParse({
            name: 'Testprojekt',
            address: 'Musterstr. 1',
            startDate: '2026-03-01',
            targetEndDate: '2026-12-01',
        });
        expect(result.success).toBe(true);
    });

    it('rejects missing name', () => {
        const result = createProjectSchema.safeParse({
            address: 'Musterstr. 1',
            startDate: '2026-03-01',
            targetEndDate: '2026-12-01',
        });
        expect(result.success).toBe(false);
    });

    it('rejects missing address', () => {
        const result = createProjectSchema.safeParse({
            name: 'Testprojekt',
            startDate: '2026-03-01',
            targetEndDate: '2026-12-01',
        });
        expect(result.success).toBe(false);
    });

    it('rejects invalid date', () => {
        const result = createProjectSchema.safeParse({
            name: 'Testprojekt',
            address: 'Musterstr. 1',
            startDate: 'not-a-date',
            targetEndDate: '2026-12-01',
        });
        expect(result.success).toBe(false);
    });

    it('accepts optional fields', () => {
        const result = createProjectSchema.safeParse({
            name: 'Testprojekt',
            address: 'Musterstr. 1',
            startDate: '2026-03-01',
            targetEndDate: '2026-12-01',
            projectNumber: 'P-001',
            clientId: validUUID,
            photoApprovalMode: 'auto',
            escalationHours: 24,
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.photoApprovalMode).toBe('auto');
            expect(result.data.escalationHours).toBe(24);
        }
    });

    it('defaults photoApprovalMode to manual', () => {
        const result = createProjectSchema.safeParse({
            name: 'Testprojekt',
            address: 'Musterstr. 1',
            startDate: '2026-03-01',
            targetEndDate: '2026-12-01',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.photoApprovalMode).toBe('manual');
        }
    });

    it('rejects name exceeding 200 chars', () => {
        const result = createProjectSchema.safeParse({
            name: 'a'.repeat(201),
            address: 'Musterstr. 1',
            startDate: '2026-03-01',
            targetEndDate: '2026-12-01',
        });
        expect(result.success).toBe(false);
    });
});

describe('updateProjectSchema', () => {
    it('accepts partial update', () => {
        const result = updateProjectSchema.safeParse({ name: 'Neuer Name' });
        expect(result.success).toBe(true);
    });

    it('accepts status field', () => {
        const result = updateProjectSchema.safeParse({ status: 'completed' });
        expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
        const result = updateProjectSchema.safeParse({ status: 'invalid' });
        expect(result.success).toBe(false);
    });
});

describe('createTradeSchema', () => {
    it('accepts valid trade', () => {
        const result = createTradeSchema.safeParse({ name: 'Rohbau' });
        expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
        const result = createTradeSchema.safeParse({ name: '' });
        expect(result.success).toBe(false);
    });

    it('accepts full trade with optional fields', () => {
        const result = createTradeSchema.safeParse({
            name: 'Elektro',
            companyName: 'Elektro GmbH',
            contractorId: validUUID,
            startDate: '2026-04-01',
            endDate: '2026-05-01',
            budget: 15000,
            canCreateSubtasks: true,
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.canCreateSubtasks).toBe(true);
        }
    });

    it('rejects negative budget', () => {
        const result = createTradeSchema.safeParse({ name: 'Test', budget: -100 });
        expect(result.success).toBe(false);
    });
});

describe('updateTradeSchema', () => {
    it('requires at least one field', () => {
        const result = updateTradeSchema.safeParse({});
        expect(result.success).toBe(false);
    });

    it('accepts valid status', () => {
        const result = updateTradeSchema.safeParse({ status: 'in_progress' });
        expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
        const result = updateTradeSchema.safeParse({ status: 'unknown' });
        expect(result.success).toBe(false);
    });
});

describe('createUserSchema', () => {
    it('accepts valid user', () => {
        const result = createUserSchema.safeParse({
            email: 'test@example.com',
            password: 'secure1234',
            name: 'Test User',
            role: 'contractor',
        });
        expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
        const result = createUserSchema.safeParse({
            email: 'not-an-email',
            password: 'secure1234',
            name: 'Test User',
            role: 'contractor',
        });
        expect(result.success).toBe(false);
    });

    it('rejects short password', () => {
        const result = createUserSchema.safeParse({
            email: 'test@example.com',
            password: '1234',
            name: 'Test User',
            role: 'contractor',
        });
        expect(result.success).toBe(false);
    });

    it('rejects architect role (only client/contractor via API)', () => {
        const result = createUserSchema.safeParse({
            email: 'test@example.com',
            password: 'secure1234',
            name: 'Test User',
            role: 'architect',
        });
        expect(result.success).toBe(false);
    });

    it('accepts optional projectIds and tradeIds', () => {
        const result = createUserSchema.safeParse({
            email: 'test@example.com',
            password: 'secure1234',
            name: 'Test User',
            role: 'client',
            projectIds: [validUUID],
            tradeIds: [validUUID],
        });
        expect(result.success).toBe(true);
    });
});

describe('createTaskSchema', () => {
    it('accepts valid task', () => {
        const result = createTaskSchema.safeParse({
            tradeId: validUUID,
            name: 'Steckdosen setzen',
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.status).toBe('pending');
        }
    });

    it('rejects missing tradeId', () => {
        const result = createTaskSchema.safeParse({ name: 'Task' });
        expect(result.success).toBe(false);
    });

    it('rejects invalid tradeId', () => {
        const result = createTaskSchema.safeParse({ tradeId: 'not-a-uuid', name: 'Task' });
        expect(result.success).toBe(false);
    });

    it('accepts all optional fields', () => {
        const result = createTaskSchema.safeParse({
            tradeId: validUUID,
            name: 'Steckdosen setzen',
            description: 'Details hier',
            status: 'in_progress',
            dueDate: '2026-05-01',
            startDate: '2026-04-01',
            endDate: '2026-04-15',
        });
        expect(result.success).toBe(true);
    });
});

describe('updateTaskSchema', () => {
    it('accepts status update', () => {
        const result = updateTaskSchema.safeParse({ status: 'done' });
        expect(result.success).toBe(true);
    });

    it('accepts blockedReason', () => {
        const result = updateTaskSchema.safeParse({
            status: 'blocked',
            blockedReason: 'Material fehlt',
        });
        expect(result.success).toBe(true);
    });

    it('rejects invalid status', () => {
        const result = updateTaskSchema.safeParse({ status: 'cancelled' });
        expect(result.success).toBe(false);
    });
});

describe('createMessageSchema', () => {
    it('accepts valid message', () => {
        const result = createMessageSchema.safeParse({
            recipientId: validUUID,
            content: 'Hallo!',
        });
        expect(result.success).toBe(true);
    });

    it('rejects empty content', () => {
        const result = createMessageSchema.safeParse({
            recipientId: validUUID,
            content: '',
        });
        expect(result.success).toBe(false);
    });

    it('rejects content exceeding 10000 chars', () => {
        const result = createMessageSchema.safeParse({
            recipientId: validUUID,
            content: 'a'.repeat(10001),
        });
        expect(result.success).toBe(false);
    });
});

describe('paginationSchema', () => {
    it('provides defaults', () => {
        const result = paginationSchema.safeParse({});
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.page).toBe(1);
            expect(result.data.limit).toBe(20);
        }
    });

    it('coerces string values', () => {
        const result = paginationSchema.safeParse({ page: '3', limit: '50' });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.page).toBe(3);
            expect(result.data.limit).toBe(50);
        }
    });

    it('rejects page 0', () => {
        const result = paginationSchema.safeParse({ page: 0 });
        expect(result.success).toBe(false);
    });

    it('rejects limit over 100', () => {
        const result = paginationSchema.safeParse({ limit: 200 });
        expect(result.success).toBe(false);
    });
});

describe('uuidParamSchema', () => {
    it('accepts valid UUID', () => {
        const result = uuidParamSchema.safeParse(validUUID);
        expect(result.success).toBe(true);
    });

    it('rejects invalid UUID', () => {
        const result = uuidParamSchema.safeParse('not-a-uuid');
        expect(result.success).toBe(false);
    });

    it('rejects empty string', () => {
        const result = uuidParamSchema.safeParse('');
        expect(result.success).toBe(false);
    });
});

describe('formatZodError', () => {
    it('formats single error', () => {
        const result = createUserSchema.safeParse({ email: 'bad', password: '1', name: '', role: 'x' });
        expect(result.success).toBe(false);
        if (!result.success) {
            const msg = formatZodError(result.error);
            expect(typeof msg).toBe('string');
            expect(msg.length).toBeGreaterThan(0);
        }
    });
});
