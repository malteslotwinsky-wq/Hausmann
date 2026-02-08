import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Project, Role } from '@/types';

// GET single project by ID
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { user } = session;
    const role = user.role as Role;

    const { data: projectData, error } = await supabase
        .from('projects')
        .select('*, trades(*, tasks(*))')
        .eq('id', id)
        .single();

    if (error) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Check access rights
    if (role === 'client' && projectData.client_id !== user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (role === 'contractor') {
        // Check if contractor is assigned to any trade in this project
        const hasAccess = projectData.trades?.some(
            (t: any) => t.contractor_id === user.id
        );
        if (!hasAccess) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }
    }

    // Map to app structure
    const project: Project = {
        id: projectData.id,
        name: projectData.name,
        projectNumber: projectData.project_number,
        address: projectData.address,
        clientId: projectData.client_id,
        architectId: projectData.architect_id,
        photoApprovalMode: projectData.photo_approval_mode || 'manual',
        escalationHours: projectData.escalation_hours || 48,
        logoUrl: projectData.logo_url,
        startDate: new Date(projectData.start_date),
        targetEndDate: new Date(projectData.target_end_date),
        status: projectData.status,
        createdAt: new Date(projectData.created_at),
        updatedAt: new Date(projectData.updated_at),
        trades: (projectData.trades || []).map((t: any) => ({
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
                updatedAt: new Date(task.updated_at || task.created_at),
                photos: [],
                comments: [],
            }))
        })).sort((a: any, b: any) => a.order - b.order)
    };

    return NextResponse.json(project);
}

// PUT update project (Architect only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify architect owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('architect_id')
            .eq('id', id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.architect_id && project.architect_id !== session.user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const body = await request.json();

        const { data, error } = await supabase
            .from('projects')
            .update({
                name: body.name,
                project_number: body.projectNumber,
                address: body.address,
                client_id: body.clientId || null,
                start_date: body.startDate,
                target_end_date: body.targetEndDate,
                photo_approval_mode: body.photoApprovalMode,
                escalation_hours: body.escalationHours,
                logo_url: body.logoUrl,
                status: body.status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE project (Architect only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    try {
        // Verify architect owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('architect_id')
            .eq('id', id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 });
        }

        if (project.architect_id && project.architect_id !== session.user.id) {
            return NextResponse.json({ error: 'Access denied' }, { status: 403 });
        }

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
