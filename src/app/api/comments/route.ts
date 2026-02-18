import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createCommentSchema, formatZodError } from '@/lib/validations';
import { Role } from '@/types';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

// GET comments (filtered by taskId query param)
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
        return NextResponse.json({ error: 'taskId ist erforderlich' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('task_comments')
            .select('*, users!author_id(name, role)')
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Comments fetch error:', error);
            return NextResponse.json({ error: 'Fehler beim Laden der Kommentare' }, { status: 500 });
        }

        const role = session.user.role as Role;
        const comments = (data || [])
            .filter((c: any) => role !== 'client' || c.visibility === 'client')
            .map((c: any) => ({
                id: c.id,
                taskId: c.task_id,
                authorId: c.author_id,
                content: c.content,
                authorName: c.users?.name || 'Unbekannt',
                authorRole: c.users?.role || 'contractor',
                visibility: c.visibility,
                createdAt: c.created_at,
            }));

        return NextResponse.json(comments);
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// POST create comment
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role === 'client') {
        return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = createCommentSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const input = parsed.data;

        // Verify task exists
        const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('id')
            .eq('id', input.taskId)
            .single();

        if (taskError || !taskData) {
            return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
        }

        const { data, error } = await supabase
            .from('task_comments')
            .insert({
                task_id: input.taskId,
                author_id: session.user.id,
                content: input.content,
                visibility: input.visibility,
            })
            .select('*, users!author_id(name, role)')
            .single();

        if (error) {
            console.error('Comment creation error:', error);
            return NextResponse.json({ error: 'Fehler beim Erstellen des Kommentars' }, { status: 500 });
        }

        return NextResponse.json({
            id: data.id,
            taskId: data.task_id,
            authorId: data.author_id,
            content: data.content,
            authorName: data.users?.name || 'Unbekannt',
            authorRole: data.users?.role || 'contractor',
            visibility: data.visibility,
            createdAt: data.created_at,
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
