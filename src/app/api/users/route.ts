import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createUser, getAllUsers } from '@/lib/users';
import { Role } from '@/types';

// GET all users (architect only)
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'architect' && session.user.role !== 'client')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const users = await getAllUsers();
    return NextResponse.json(users);
}

// POST create new user (architect only)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { email, password, name, role, projectIds, tradeIds } = body;

        // Validate required fields
        if (!email || !password || !name || !role) {
            return NextResponse.json({ error: 'Fehlende Pflichtfelder' }, { status: 400 });
        }

        // Validate role
        if (!['client', 'contractor'].includes(role)) {
            return NextResponse.json({ error: 'Ungültige Rolle' }, { status: 400 });
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json({ error: 'Passwort muss mindestens 6 Zeichen haben' }, { status: 400 });
        }

        const newUser = createUser(
            email,
            password,
            name,
            role as Role,
            session.user.id,
            projectIds,
            tradeIds
        );

        if (!newUser) {
            return NextResponse.json({ error: 'E-Mail existiert bereits' }, { status: 409 });
        }

        return NextResponse.json(newUser, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Server-Fehler' }, { status: 500 });
    }
}
