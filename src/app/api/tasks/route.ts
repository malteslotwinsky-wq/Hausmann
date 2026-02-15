import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createTaskSchema, paginationSchema, formatZodError } from '@/lib/validations';
import type { PaginatedResponse } from '@/lib/validations';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

// GET tasks (optionally filtered by tradeId/projectId, paginated)
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tradeId = searchParams.get('tradeId');
    const projectId = searchParams.get('projectId');

    const pageParsed = paginationSchema.safeParse({
        page: searchParams.get('page') ?? 1,
        limit: searchParams.get('limit') ?? 20,
    });
    const { page, limit } = pageParsed.success ? pageParsed.data : { page: 1, limit: 20 };
    const offset = (page - 1) * limit;

    try {
        let tradeIds: string[] | null = null;

        if (tradeId) {
            tradeIds = [tradeId];
        } else if (projectId) {
            const { data: trades } = await supabase
                .from('trades')
                .select('id')
                .eq('project_id', projectId);

            if (trades && trades.length > 0) {
                tradeIds = trades.map(t => t.id);
            } else {
                const empty: PaginatedResponse<never> = {
                    data: [],
                    pagination: { page, limit, total: 0, totalPages: 0 },
                };
                return NextResponse.json(empty);
            }
        }

        // Count total
        let countQuery = supabase.from('tasks').select('*', { count: 'exact', head: true });
        if (tradeIds) countQuery = countQuery.in('trade_id', tradeIds);
        const { count } = await countQuery;
        const total = count ?? 0;

        // Fetch page
        let query = supabase.from('tasks').select('*');
        if (tradeIds) query = query.in('trade_id', tradeIds);
        const { data, error } = await query
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Tasks fetch error:', error);
            return NextResponse.json({ error: 'Fehler beim Laden der Aufgaben' }, { status: 500 });
        }

        const tasks = (data || []).map((t: any) => ({
            id: t.id,
            tradeId: t.trade_id,
            title: t.name,
            description: t.description,
            status: t.status,
            blockedReason: t.blocked_reason,
            dueDate: t.due_date,
            startDate: t.start_date,
            endDate: t.end_date,
            createdAt: t.created_at,
            updatedAt: t.updated_at,
            photos: [],
            comments: [],
        }));

        const response: PaginatedResponse<typeof tasks[number]> = {
            data: tasks,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };

        return NextResponse.json(response);
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// POST create task
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only architects and contractors (with permission) can create tasks
    const role = session.user.role;
    if (role === 'client') {
        return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = createTaskSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const input = parsed.data;

        // Verify the trade exists and user has access
        const { data: trade } = await supabase
            .from('trades')
            .select('id, project_id, contractor_id, can_create_subtasks')
            .eq('id', input.tradeId)
            .single();

        if (!trade) {
            return NextResponse.json({ error: 'Gewerk nicht gefunden' }, { status: 404 });
        }

        // Contractors can only add tasks to their own trades with permission
        if (role === 'contractor') {
            if (trade.contractor_id !== session.user.id) {
                return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
            }
            if (!trade.can_create_subtasks) {
                return NextResponse.json({ error: 'Keine Berechtigung zum Erstellen von Aufgaben' }, { status: 403 });
            }
        }

        const { data, error } = await supabase
            .from('tasks')
            .insert({
                trade_id: input.tradeId,
                name: input.name,
                description: input.description || null,
                status: input.status,
                due_date: input.dueDate || null,
                start_date: input.startDate || null,
                end_date: input.endDate || null,
            })
            .select()
            .single();

        if (error) {
            console.error('Task creation error:', error);
            return NextResponse.json({ error: 'Fehler beim Erstellen der Aufgabe' }, { status: 500 });
        }

        return NextResponse.json({
            id: data.id,
            tradeId: data.trade_id,
            title: data.name,
            description: data.description,
            status: data.status,
            blockedReason: data.blocked_reason,
            dueDate: data.due_date,
            startDate: data.start_date,
            endDate: data.end_date,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            photos: [],
            comments: [],
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
