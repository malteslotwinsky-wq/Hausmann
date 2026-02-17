import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { updateTaskSchema, uuidParamSchema, formatZodError } from '@/lib/validations';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

// PATCH update task (status change, edit details)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await params;
    if (!uuidParamSchema.safeParse(taskId).success) {
        return NextResponse.json({ error: 'Ungültige Task-ID' }, { status: 400 });
    }

    const role = session.user.role;
    if (role === 'client') {
        return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = updateTaskSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const input = parsed.data;

        // Verify the task exists and user has access
        const { data: task } = await supabase
            .from('tasks')
            .select('id, trade_id')
            .eq('id', taskId)
            .single();

        if (!task) {
            return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
        }

        // Contractors can only update tasks in their own trades
        if (role === 'contractor') {
            const { data: trade } = await supabase
                .from('trades')
                .select('contractor_id')
                .eq('id', task.trade_id)
                .single();

            if (!trade || trade.contractor_id !== session.user.id) {
                return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
            }
        }

        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.blockedReason !== undefined) updateData.blocked_reason = input.blockedReason;
        if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
        if (input.startDate !== undefined) updateData.start_date = input.startDate;
        if (input.endDate !== undefined) updateData.end_date = input.endDate;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Keine Änderungen' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(updateData)
            .eq('id', taskId)
            .select('*, photos(*), task_comments(*, users!author_id(name, role))')
            .single();

        if (error) {
            console.error('Task update error:', error);
            return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
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
            photos: (data.photos || []).map((p: any) => ({
                id: p.id,
                taskId: p.task_id,
                fileUrl: p.file_url,
                thumbnailUrl: p.thumbnail_url || p.file_url,
                uploadedBy: p.uploaded_by,
                uploadedAt: p.created_at,
                visibility: p.visibility,
                caption: p.caption,
            })),
            comments: (data.task_comments || []).map((c: any) => ({
                id: c.id,
                taskId: c.task_id,
                content: c.content,
                authorName: c.users?.name || 'Unbekannt',
                authorRole: c.users?.role || 'contractor',
                visibility: c.visibility,
                createdAt: c.created_at,
            })),
        });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// DELETE task
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ taskId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await params;
    if (!uuidParamSchema.safeParse(taskId).success) {
        return NextResponse.json({ error: 'Ungültige Task-ID' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId);

        if (error) {
            console.error('Task delete error:', error);
            return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
