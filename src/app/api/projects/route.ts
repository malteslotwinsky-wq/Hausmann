import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { demoProjects, generateId } from '@/lib/demo-data';
import { Project } from '@/types';

// In-memory project store (extends demo-data)
let projects: Project[] = [...demoProjects];

export function getProjects(): Project[] {
    return projects;
}

export function addProject(project: Project): void {
    projects.push(project);
}

// GET all projects (architect only sees all, others filtered)
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role === 'architect') {
        return NextResponse.json(projects);
    }

    if (session.user.role === 'client') {
        const accessibleProjects = projects.filter(p =>
            session.user.projectIds?.includes(p.id)
        );
        return NextResponse.json(accessibleProjects);
    }

    // Contractors see all for now (filtered by trade in UI)
    return NextResponse.json(projects);
}

// POST create new project (architect only)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, address, clientId, clientName, startDate, targetEndDate } = body;

        // Validate required fields
        if (!name || !address) {
            return NextResponse.json({ error: 'Name und Adresse sind Pflichtfelder' }, { status: 400 });
        }

        const newProject: Project = {
            id: `project-${generateId().slice(0, 8)}`,
            name,
            address,
            clientId: clientId || undefined,
            clientName: clientName || 'Nicht zugewiesen',
            startDate: startDate ? new Date(startDate) : new Date(),
            targetEndDate: targetEndDate ? new Date(targetEndDate) : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // +6 months
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            trades: [],
        };

        projects.push(newProject);

        return NextResponse.json(newProject, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 });
    }
}
