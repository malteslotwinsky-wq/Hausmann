
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Project, Role } from '@/types';
import { createProjectSchema, formatZodError } from '@/lib/validations';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

// GET all projects (Filtered by role)
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const role = user.role as Role;
    const orgId = '00000000-0000-0000-0000-000000000001'; // Default Hausmann Org

    try {
        let query = supabase.from('projects')
            .select('*, trades(*, tasks(*, photos(*)))')
            .eq('organization_id', orgId);

        // Filter based on role
        if (role === 'client') {
            query = query.eq('client_id', user.id);
        }

        const { data: projectsData, error } = await query;

        if (error) {
            console.error('Projects fetch error:', error);
            return NextResponse.json({ error: 'Fehler beim Laden der Projekte' }, { status: 500 });
        }

        // For contractors: filter to only projects where they have assigned trades
        let filteredProjects = projectsData || [];
        if (role === 'contractor') {
            filteredProjects = filteredProjects.filter((p: any) =>
                p.trades?.some((t: any) => t.contractor_id === user.id)
            );
        }

        // Map DB structure to App structure (snake_case to camelCase)
        const projects: Project[] = filteredProjects.map((p: any) => ({
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
                    comments: [],
                }))
            })).sort((a: any, b: any) => a.order - b.order)
        }));

        return NextResponse.json(projects);
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// POST create project (Architect only)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = createProjectSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const { data: input } = parsed;
        const orgId = '00000000-0000-0000-0000-000000000001';

        // Insert project with all new fields
        const { data, error } = await supabase
            .from('projects')
            .insert({
                organization_id: orgId,
                name: input.name,
                project_number: input.projectNumber || null,
                address: input.address,
                client_id: input.clientId || null,
                architect_id: session.user.id, // Current architect
                start_date: input.startDate,
                target_end_date: input.targetEndDate,
                photo_approval_mode: input.photoApprovalMode,
                escalation_hours: input.escalationHours,
                logo_url: input.logoUrl || null,
                status: 'active'
            })
            .select()
            .single();

        if (error) {
            console.error('Project creation error:', error);
            return NextResponse.json({ error: 'Fehler beim Erstellen des Projekts' }, { status: 500 });
        }

        // If client was assigned, update their project_ids
        if (input.clientId) {
            const { data: clientData } = await supabase
                .from('users')
                .select('project_ids')
                .eq('id', input.clientId)
                .single();

            if (clientData) {
                const currentProjectIds = clientData.project_ids || [];
                if (!currentProjectIds.includes(data.id)) {
                    await supabase
                        .from('users')
                        .update({ project_ids: [...currentProjectIds, data.id] })
                        .eq('id', input.clientId);
                }
            }
        }

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
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
