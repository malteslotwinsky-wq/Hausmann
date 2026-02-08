import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

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

    try {
        const body = await request.json();

        const updateData: Record<string, unknown> = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.companyName !== undefined) updateData.company_name = body.companyName;
        if (body.contactPerson !== undefined) updateData.contact_person = body.contactPerson;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.description !== undefined) updateData.description = body.description;
        if (body.contractorId !== undefined) updateData.contractor_id = body.contractorId;
        if (body.startDate !== undefined) updateData.start_date = body.startDate;
        if (body.endDate !== undefined) updateData.end_date = body.endDate;
        if (body.budget !== undefined) updateData.budget = body.budget;
        if (body.order !== undefined) updateData.order = body.order;
        if (body.status !== undefined) updateData.status = body.status;
        if (body.canCreateSubtasks !== undefined) updateData.can_create_subtasks = body.canCreateSubtasks;

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

        if (error) throw error;

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
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server-Fehler' }, { status: 500 });
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

    try {
        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('id', tradeId)
            .eq('project_id', projectId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server-Fehler' }, { status: 500 });
    }
}
