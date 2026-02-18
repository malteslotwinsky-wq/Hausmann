import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { updateTradeSchema, uuidParamSchema, formatZodError } from '@/lib/validations';

// PATCH update trade
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; tradeId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, tradeId } = await params;

    if (!uuidParamSchema.safeParse(projectId).success || !uuidParamSchema.safeParse(tradeId).success) {
        return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 });
    }

    try {
        // Verify architect owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('architect_id')
            .eq('id', projectId)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });
        }

        if (project.architect_id && project.architect_id !== session.user.id) {
            return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
        }

        const body = await request.json();
        const parsed = updateTradeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const input = parsed.data;
        const updateData: Record<string, unknown> = {};

        if (input.name !== undefined) updateData.name = input.name;
        if (input.companyName !== undefined) updateData.company_name = input.companyName;
        if (input.contactPerson !== undefined) updateData.contact_person = input.contactPerson;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.contractorId !== undefined) updateData.contractor_id = input.contractorId ?? null;
        if (input.startDate !== undefined) updateData.start_date = input.startDate;
        if (input.endDate !== undefined) updateData.end_date = input.endDate;
        if (input.budget !== undefined) updateData.budget = input.budget;
        if (input.order !== undefined) updateData.order = input.order;
        if (input.status !== undefined) updateData.status = input.status;
        if (input.canCreateSubtasks !== undefined) updateData.can_create_subtasks = input.canCreateSubtasks;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Keine Änderungen' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('trades')
            .update(updateData)
            .eq('id', tradeId)
            .eq('project_id', projectId)
            .select()
            .single();

        if (error) {
            console.error('Trade update error:', error);
            return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
        }

        return NextResponse.json({
            id: data.id,
            projectId: data.project_id,
            name: data.name,
            companyName: data.company_name,
            contactPerson: data.contact_person,
            phone: data.phone,
            description: data.description,
            contractorId: data.contractor_id,
            startDate: data.start_date,
            endDate: data.end_date,
            budget: data.budget,
            order: data.order,
            status: data.status,
            canCreateSubtasks: data.can_create_subtasks,
        });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// DELETE trade
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; tradeId: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId, tradeId } = await params;

    if (!uuidParamSchema.safeParse(projectId).success || !uuidParamSchema.safeParse(tradeId).success) {
        return NextResponse.json({ error: 'Ungültige ID' }, { status: 400 });
    }

    try {
        // Verify architect owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('architect_id')
            .eq('id', projectId)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });
        }

        if (project.architect_id && project.architect_id !== session.user.id) {
            return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
        }

        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('id', tradeId)
            .eq('project_id', projectId);

        if (error) {
            console.error('Trade delete error:', error);
            return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
