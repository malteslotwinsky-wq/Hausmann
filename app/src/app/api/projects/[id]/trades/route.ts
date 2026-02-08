import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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

    try {
        const body = await request.json();

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
                name: body.name,
                company_name: body.companyName || null,
                contact_person: body.contactPerson || null,
                phone: body.phone || null,
                description: body.description || null,
                contractor_id: body.contractorId || null,
                start_date: body.startDate || null,
                end_date: body.endDate || null,
                predecessor_trade_id: body.predecessorTradeId || null,
                budget: body.budget || null,
                can_create_subtasks: body.canCreateSubtasks || false,
                order: nextOrder,
                status: 'pending'
            })
            .select()
            .single();

        if (error) throw error;

        // If a contractor was assigned, update their project assignments
        if (body.contractorId) {
            // Get the user's current project_ids
            const { data: userData } = await supabase
                .from('users')
                .select('project_ids')
                .eq('id', body.contractorId)
                .single();

            if (userData) {
                const currentProjectIds = userData.project_ids || [];
                if (!currentProjectIds.includes(projectId)) {
                    await supabase
                        .from('users')
                        .update({ project_ids: [...currentProjectIds, projectId] })
                        .eq('id', body.contractorId);
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
    } catch (error: any) {
        console.error('Trade creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
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

    try {
        const { data, error } = await supabase
            .from('trades')
            .select('*, tasks(*)')
            .eq('project_id', projectId)
            .order('order', { ascending: true });

        if (error) throw error;

        const trades = data.map((t: any) => ({
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
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
