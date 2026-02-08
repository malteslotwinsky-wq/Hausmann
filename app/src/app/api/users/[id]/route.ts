import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

// PUT update user (architect can update any, users can update own profile)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const isOwnProfile = session.user.id === id;
    const isArchitect = session.user.role === 'architect';

    if (!isOwnProfile && !isArchitect) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();

        const updateData: Record<string, unknown> = {};

        // Fields everyone can update on their own profile
        if (body.name !== undefined) updateData.name = body.name;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.company !== undefined) updateData.company = body.company;
        if (body.avatarUrl !== undefined) updateData.avatar_url = body.avatarUrl;

        // Fields only architects can update
        if (isArchitect) {
            if (body.role !== undefined) updateData.role = body.role;
            if (body.email !== undefined) updateData.email = body.email;
            if (body.projectIds !== undefined) updateData.project_ids = body.projectIds;
        }

        // Password change
        if (body.password) {
            if (body.password.length < 6) {
                return NextResponse.json({ error: 'Passwort muss mindestens 6 Zeichen haben' }, { status: 400 });
            }
            updateData.password = await bcrypt.hash(body.password, 10);
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'Keine Änderungen' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .select('id, email, name, role, phone, company, avatar_url, created_at')
            .single();

        if (error) throw error;

        return NextResponse.json({
            id: data.id,
            email: data.email,
            name: data.name,
            role: data.role,
            phone: data.phone,
            company: data.company,
            avatarUrl: data.avatar_url,
            createdAt: data.created_at,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server-Fehler' }, { status: 500 });
    }
}

// DELETE user (architect only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Prevent self-deletion
    if (session.user.id === id) {
        return NextResponse.json({ error: 'Eigenen Account kann nicht gelöscht werden' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || 'Server-Fehler' }, { status: 500 });
    }
}
