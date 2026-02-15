import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createTradeSchema, uuidParamSchema, formatZodError } from '@/lib/validations';

// POST create trade for a project
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const idCheck = uuidParamSchema.safeParse(projectId);
    if (!idCheck.success) {
        return NextResponse.json({ error: 'Ungültige Projekt-ID' }, { status: 400 });
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
        const parsed = createTradeSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const input = parsed.data;

        // Get the next order number
        const { data: existingTrades } = await supabase
            .from('trades')
            .select('order')
            .eq('project_id', projectId)
            .order('order', { ascending: false })
            .limit(1);

        const nextOrder = existingTrades && existingTrades.length > 0
            ? (existingTrades[0].order || 0) + 1
            : 0;

        // Insert the trade
        const { data, error } = await supabase
            .from('trades')
            .insert({
                project_id: projectId,
                name: input.name,
                company_name: input.companyName || null,
                contact_person: input.contactPerson || null,
                phone: input.phone || null,
                description: input.description || null,
                contractor_id: input.contractorId || null,
                start_date: input.startDate || null,
                end_date: input.endDate || null,
                predecessor_trade_id: input.predecessorTradeId || null,
                budget: input.budget || null,
                can_create_subtasks: input.canCreateSubtasks,
                order: nextOrder,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            console.error('Trade creation error:', error);
            return NextResponse.json({ error: 'Fehler beim Erstellen des Gewerks' }, { status: 500 });
        }

        // If a contractor was assigned, update their project assignments
        if (input.contractorId) {
            const { data: userData } = await supabase
                .from('users')
                .select('project_ids')
                .eq('id', input.contractorId)
                .single();

            if (userData) {
                const currentProjectIds = userData.project_ids || [];
                if (!currentProjectIds.includes(projectId)) {
                    await supabase
                        .from('users')
                        .update({ project_ids: [...currentProjectIds, projectId] })
                        .eq('id', input.contractorId);
                }
            }
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
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// GET trades for a project
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: projectId } = await params;
    const idCheck = uuidParamSchema.safeParse(projectId);
    if (!idCheck.success) {
        return NextResponse.json({ error: 'Ungültige Projekt-ID' }, { status: 400 });
    }

    try {
        const { data, error } = await supabase
            .from('trades')
            .select('*, tasks(*)')
            .eq('project_id', projectId)
            .order('order', { ascending: true });

        if (error) {
            console.error('Trades fetch error:', error);
            return NextResponse.json({ error: 'Fehler beim Laden der Gewerke' }, { status: 500 });
        }

        const trades = (data || []).map((t: any) => ({
            id: t.id,
            projectId: t.project_id,
            name: t.name,
            companyName: t.company_name,
            contactPerson: t.contact_person,
            phone: t.phone,
            description: t.description,
            contractorId: t.contractor_id,
            startDate: t.start_date,
            endDate: t.end_date,
            budget: t.budget,
            order: t.order,
            status: t.status,
            canCreateSubtasks: t.can_create_subtasks,
            tasks: t.tasks || [],
        }));

        return NextResponse.json(trades);
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
