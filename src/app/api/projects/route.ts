
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Project, Role } from '@/types';

// GET all projects (Filtered by role)
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const role = user.role as Role;
    const orgId = '00000000-0000-0000-0000-000000000001'; // Default Hausmann Org

    let query = supabase.from('projects')
        .select('*, trades(*, tasks(*))')
        .eq('organization_id', orgId);

    // Filter based on role
    if (role === 'client') {
        query = query.eq('client_id', user.id);
    }

    const { data: projectsData, error } = await query;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Map DB structure to App structure (snake_case to camelCase)
    const projects: Project[] = projectsData.map((p: any) => ({
        id: p.id,
        name: p.name,
        projectNumber: p.project_number,
        address: p.address,
        clientId: p.client_id,
        architectId: p.architect_id,
        photoApprovalMode: p.photo_approval_mode || 'manual',
        escalationHours: p.escalation_hours || 48,
        logoUrl: p.logo_url,
        startDate: new Date(p.start_date),
        targetEndDate: new Date(p.target_end_date),
        status: p.status,
        createdAt: new Date(p.created_at),
        updatedAt: new Date(p.updated_at),
        trades: (p.trades || []).map((t: any) => ({
            id: t.id,
            projectId: t.project_id,
            name: t.name,
            contractorId: t.contractor_id,
            companyName: t.company_name,
            contactPerson: t.contact_person,
            phone: t.phone,
            description: t.description,
            startDate: t.start_date ? new Date(t.start_date) : undefined,
            endDate: t.end_date ? new Date(t.end_date) : undefined,
            budget: t.budget,
            order: t.order,
            status: t.status,
            canCreateSubtasks: t.can_create_subtasks,
            tasks: (t.tasks || []).map((task: any) => ({
                id: task.id,
                tradeId: task.trade_id,
                title: task.name,
                status: task.status,
                createdAt: new Date(task.created_at),
                updatedAt: new Date(task.created_at),
                photos: [],
                comments: [],
            }))
        })).sort((a: any, b: any) => a.order - b.order)
    }));

    return NextResponse.json(projects);
}

// POST create project (Architect only)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const orgId = '00000000-0000-0000-0000-000000000001';

        // Insert project with all new fields
        const { data, error } = await supabase
            .from('projects')
            .insert({
                organization_id: orgId,
                name: body.name,
                project_number: body.projectNumber || null,
                address: body.address,
                client_id: body.clientId || null,
                architect_id: session.user.id, // Current architect
                start_date: body.startDate,
                target_end_date: body.targetEndDate,
                photo_approval_mode: body.photoApprovalMode || 'manual',
                escalation_hours: body.escalationHours || 48,
                logo_url: body.logoUrl || null,
                status: 'active'
            })
            .select()
            .single();

        if (error) throw error;

        // If client was assigned, update their project_ids
        if (body.clientId) {
            const { data: clientData } = await supabase
                .from('users')
                .select('project_ids')
                .eq('id', body.clientId)
                .single();

            if (clientData) {
                const currentProjectIds = clientData.project_ids || [];
                if (!currentProjectIds.includes(data.id)) {
                    await supabase
                        .from('users')
                        .update({ project_ids: [...currentProjectIds, data.id] })
                        .eq('id', body.clientId);
                }
            }
        }

        // If phases provided, we could insert into a phases table (future enhancement)
        // For now, phases are informational only

        return NextResponse.json({
            id: data.id,
            name: data.name,
            projectNumber: data.project_number,
            address: data.address,
            clientId: data.client_id,
            architectId: data.architect_id,
            startDate: data.start_date,
            targetEndDate: data.target_end_date,
            photoApprovalMode: data.photo_approval_mode,
            escalationHours: data.escalation_hours,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            trades: [],
        }, { status: 201 });
    } catch (error: any) {
        console.error('Project creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
