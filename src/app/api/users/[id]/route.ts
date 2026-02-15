import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';
import { updateUserSchema, uuidParamSchema, formatZodError } from '@/lib/validations';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

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
    const idCheck = uuidParamSchema.safeParse(id);
    if (!idCheck.success) {
        return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 });
    }

    const isOwnProfile = session.user.id === id;
    const isArchitect = session.user.role === 'architect';

    if (!isOwnProfile && !isArchitect) {
        return NextResponse.json({ error: 'Zugriff verweigert' }, { status: 403 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = updateUserSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const input = parsed.data;
        const updateData: Record<string, unknown> = {};

        // Fields everyone can update on their own profile
        if (input.name !== undefined) updateData.name = input.name;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.company !== undefined) updateData.company = input.company;
        if (input.avatarUrl !== undefined) updateData.avatar_url = input.avatarUrl;

        // Fields only architects can update
        if (isArchitect) {
            if (input.role !== undefined) updateData.role = input.role;
            if (input.email !== undefined) updateData.email = input.email;
            if (input.projectIds !== undefined) updateData.project_ids = input.projectIds;
        } else {
            // Non-architects cannot change role, email, or projectIds
            if (input.role !== undefined || input.email !== undefined || input.projectIds !== undefined) {
                return NextResponse.json({ error: 'Keine Berechtigung für diese Felder' }, { status: 403 });
            }
        }

        // Password change
        if (input.password) {
            // For own profile changes, require current password
            if (isOwnProfile) {
                if (!input.currentPassword) {
                    return NextResponse.json({ error: 'Aktuelles Passwort ist erforderlich' }, { status: 400 });
                }

                // Fetch current password hash
                const { data: userData } = await supabase
                    .from('users')
                    .select('password')
                    .eq('id', id)
                    .single();

                if (!userData) {
                    return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
                }

                const isCurrentValid = await bcrypt.compare(input.currentPassword, userData.password);
                if (!isCurrentValid) {
                    return NextResponse.json({ error: 'Aktuelles Passwort ist falsch' }, { status: 400 });
                }
            }

            updateData.password = await bcrypt.hash(input.password, 10);
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

        if (error) {
            console.error('User update error:', error);
            return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
        }

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
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
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
    const idCheck = uuidParamSchema.safeParse(id);
    if (!idCheck.success) {
        return NextResponse.json({ error: 'Ungültige Benutzer-ID' }, { status: 400 });
    }

    // Prevent self-deletion
    if (session.user.id === id) {
        return NextResponse.json({ error: 'Eigenen Account kann nicht gelöscht werden' }, { status: 400 });
    }

    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('User delete error:', error);
            return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
