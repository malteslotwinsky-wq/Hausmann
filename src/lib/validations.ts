import { z } from 'zod';

// --- Shared ---
const uuidSchema = z.string().uuid('Ungültige ID');
const roleSchema = z.enum(['architect', 'contractor', 'client'], {
    error: 'Ungültige Rolle. Erlaubt: architect, contractor, client',
});
const passwordSchema = z.string()
    .min(8, 'Passwort muss mindestens 8 Zeichen haben')
    .regex(/[A-Z]/, 'Passwort muss mindestens einen Großbuchstaben enthalten')
    .regex(/[a-z]/, 'Passwort muss mindestens einen Kleinbuchstaben enthalten')
    .regex(/[0-9]/, 'Passwort muss mindestens eine Zahl enthalten');
const dateStringSchema = z.string().refine(
    (val) => !isNaN(Date.parse(val)),
    { message: 'Ungültiges Datumsformat' }
);

// --- Projects ---
export const createProjectSchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich').max(200, 'Name zu lang'),
    projectNumber: z.string().max(50).optional().nullable(),
    address: z.string().min(1, 'Adresse ist erforderlich').max(500, 'Adresse zu lang'),
    clientId: uuidSchema.optional().nullable(),
    startDate: dateStringSchema,
    targetEndDate: dateStringSchema,
    photoApprovalMode: z.enum(['manual', 'auto']).optional().default('manual'),
    escalationHours: z.number().int().min(1).max(720).optional().default(48),
    logoUrl: z.string().url().max(2000).optional().nullable(),
});

export const updateProjectSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    projectNumber: z.string().max(50).optional().nullable(),
    address: z.string().min(1).max(500).optional(),
    clientId: uuidSchema.optional().nullable(),
    startDate: dateStringSchema.optional(),
    targetEndDate: dateStringSchema.optional(),
    photoApprovalMode: z.enum(['manual', 'auto']).optional(),
    escalationHours: z.number().int().min(1).max(720).optional(),
    logoUrl: z.string().url().max(2000).optional().nullable(),
    status: z.enum(['active', 'paused', 'completed', 'archived']).optional(),
});

// --- Trades ---
const tradeStatusSchema = z.enum(['pending', 'in_progress', 'done', 'delayed', 'blocked']);

export const createTradeSchema = z.object({
    name: z.string().min(1, 'Name ist erforderlich').max(200, 'Name zu lang'),
    companyName: z.string().max(200).optional().nullable(),
    contactPerson: z.string().max(200).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    contractorId: uuidSchema.optional().nullable(),
    startDate: dateStringSchema.optional().nullable(),
    endDate: dateStringSchema.optional().nullable(),
    predecessorTradeId: uuidSchema.optional().nullable(),
    budget: z.number().min(0).max(999_999_999).optional().nullable(),
    canCreateSubtasks: z.boolean().optional().default(false),
});

export const updateTradeSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    companyName: z.string().max(200).optional().nullable(),
    contactPerson: z.string().max(200).optional().nullable(),
    phone: z.string().max(50).optional().nullable(),
    description: z.string().max(5000).optional().nullable(),
    contractorId: uuidSchema.optional().nullable(),
    startDate: dateStringSchema.optional().nullable(),
    endDate: dateStringSchema.optional().nullable(),
    budget: z.number().min(0).max(999_999_999).optional().nullable(),
    order: z.number().int().min(0).optional(),
    status: tradeStatusSchema.optional(),
    canCreateSubtasks: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
    message: 'Mindestens ein Feld muss angegeben werden',
});

// --- Users ---
export const createUserSchema = z.object({
    email: z.string().email('Ungültige E-Mail-Adresse').max(254),
    password: passwordSchema,
    name: z.string().min(1, 'Name ist erforderlich').max(200),
    role: z.enum(['client', 'contractor'], {
        error: 'Rolle muss client oder contractor sein',
    }),
    phone: z.string().max(50).optional(),
    company: z.string().max(200).optional(),
    projectIds: z.array(uuidSchema).optional(),
    tradeIds: z.array(uuidSchema).optional(),
});

export const updateUserSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    phone: z.string().max(50).optional(),
    company: z.string().max(200).optional(),
    avatarUrl: z.string().url().max(2000).optional().nullable(),
    // Architect-only fields (checked in route handler)
    role: roleSchema.optional(),
    email: z.string().email().max(254).optional(),
    projectIds: z.array(uuidSchema).optional(),
    // Password change
    password: passwordSchema.optional(),
    currentPassword: z.string().optional(),
});

// --- Tasks ---
const taskStatusSchema = z.enum(['pending', 'in_progress', 'done', 'blocked']);

export const createTaskSchema = z.object({
    tradeId: uuidSchema,
    name: z.string().min(1, 'Name ist erforderlich').max(500),
    description: z.string().max(5000).optional().nullable(),
    status: taskStatusSchema.optional().default('pending'),
    dueDate: dateStringSchema.optional().nullable(),
    startDate: dateStringSchema.optional().nullable(),
    endDate: dateStringSchema.optional().nullable(),
});

export const updateTaskSchema = z.object({
    name: z.string().min(1).max(500).optional(),
    description: z.string().max(5000).optional().nullable(),
    status: taskStatusSchema.optional(),
    blockedReason: z.string().max(1000).optional().nullable(),
    dueDate: dateStringSchema.optional().nullable(),
    startDate: dateStringSchema.optional().nullable(),
    endDate: dateStringSchema.optional().nullable(),
});

// --- Comments ---
const commentVisibilitySchema = z.enum(['internal', 'client']);

export const createCommentSchema = z.object({
    taskId: uuidSchema,
    content: z.string().min(1, 'Kommentar darf nicht leer sein').max(5000, 'Kommentar zu lang'),
    visibility: commentVisibilitySchema.optional().default('internal'),
});

// --- Messages ---
export const createMessageSchema = z.object({
    recipientId: uuidSchema,
    content: z.string().min(1, 'Nachricht darf nicht leer sein').max(10000, 'Nachricht zu lang'),
});

// --- Pagination ---
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// --- UUID param validation ---
export const uuidParamSchema = uuidSchema;

// --- Helper: format Zod errors ---
export function formatZodError(error: z.ZodError): string {
    return error.issues.map(e => e.message).join(', ');
}
