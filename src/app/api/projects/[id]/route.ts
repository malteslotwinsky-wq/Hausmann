import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Project, Role } from '@/types';
import { updateProjectSchema, uuidParamSchema, formatZodError } from '@/lib/validations';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

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
    const idCheck = uuidParamSchema.safeParse(id);
    if (!idCheck.success) {
        return NextResponse.json({ error: 'Ungültige Projekt-ID' }, { status: 400 });
    }

    const { user } = session;
    const role = user.role as Role;

    const { data: projectData, error } = await supabase
        .from('projects')
        .select('*, trades(*, tasks(*, photos(*), task_comments(*, users!author_id(name, role))))')
        .eq('id', id)
        .single();

    if (error || !projectData) {
        return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });
    }

    // Check access rights
    if (role === 'client' && projectData.client_id !== user.id) {
        return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }

    if (role === 'contractor') {
        // Check if contractor is assigned to any trade in this project
        const hasAccess = projectData.trades?.some(
            (t: any) => t.contractor_id === user.id
        );
        if (!hasAccess) {
            return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
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
                description: task.description,
                status: task.status,
                blockedReason: task.blocked_reason,
                dueDate: task.due_date ? new Date(task.due_date) : undefined,
                createdAt: new Date(task.created_at),
                updatedAt: new Date(task.updated_at || task.created_at),
                photos: (task.photos || [])
                    .filter((photo: any) => role !== 'client' || photo.visibility === 'client')
                    .map((photo: any) => ({
                        id: photo.id,
                        taskId: photo.task_id,
                        fileUrl: photo.file_url,
                        thumbnailUrl: photo.thumbnail_url || photo.file_url,
                        uploadedBy: photo.uploaded_by,
                        uploadedAt: new Date(photo.created_at),
                        visibility: photo.visibility,
                        caption: photo.caption,
                    })),
                comments: (task.task_comments || [])
                    .filter((c: any) => role !== 'client' || c.visibility === 'client')
                    .map((c: any) => ({
                        id: c.id,
                        taskId: c.task_id,
                        authorId: c.author_id,
                        content: c.content,
                        authorName: c.users?.name || 'Unbekannt',
                        authorRole: c.users?.role || 'contractor',
                        visibility: c.visibility,
                        createdAt: new Date(c.created_at),
                    })),
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
    const idCheck = uuidParamSchema.safeParse(id);
    if (!idCheck.success) {
        return NextResponse.json({ error: 'Ungültige Projekt-ID' }, { status: 400 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = updateProjectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const input = parsed.data;

        // Verify architect owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('architect_id')
            .eq('id', id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });
        }

        if (project.architect_id && project.architect_id !== session.user.id) {
            return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
        }

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (input.name !== undefined) updateData.name = input.name;
        if (input.projectNumber !== undefined) updateData.project_number = input.projectNumber;
        if (input.address !== undefined) updateData.address = input.address;
        if (input.clientId !== undefined) updateData.client_id = input.clientId;
        if (input.startDate !== undefined) updateData.start_date = input.startDate;
        if (input.targetEndDate !== undefined) updateData.target_end_date = input.targetEndDate;
        if (input.photoApprovalMode !== undefined) updateData.photo_approval_mode = input.photoApprovalMode;
        if (input.escalationHours !== undefined) updateData.escalation_hours = input.escalationHours;
        if (input.logoUrl !== undefined) updateData.logo_url = input.logoUrl;
        if (input.status !== undefined) updateData.status = input.status;

        const { data, error } = await supabase
            .from('projects')
            .update(updateData)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Project update error:', error);
            return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
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
    const idCheck = uuidParamSchema.safeParse(id);
    if (!idCheck.success) {
        return NextResponse.json({ error: 'Ungültige Projekt-ID' }, { status: 400 });
    }

    try {
        // Verify architect owns this project
        const { data: project } = await supabase
            .from('projects')
            .select('architect_id')
            .eq('id', id)
            .single();

        if (!project) {
            return NextResponse.json({ error: 'Projekt nicht gefunden' }, { status: 404 });
        }

        if (project.architect_id && project.architect_id !== session.user.id) {
            return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
        }

        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Project delete error:', error);
            return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
