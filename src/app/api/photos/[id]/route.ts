import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Role } from '@/types';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

// PATCH update photo visibility/caption
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role === 'client') {
        return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    const { id } = await params;

    try {
        // Fetch photo first to check ownership
        const { data: photo, error: fetchError } = await supabase
            .from('photos')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !photo) {
            return NextResponse.json({ error: 'Foto nicht gefunden' }, { status: 404 });
        }

        // Only the uploader or an architect can update
        if (role !== 'architect' && photo.uploaded_by !== session.user.id) {
            return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 });
        }

        const body = await request.json();
        const updates: Record<string, any> = {};

        if (body.visibility && ['internal', 'client'].includes(body.visibility)) {
            updates.visibility = body.visibility;
        }

        if (body.caption !== undefined) {
            updates.caption = body.caption || null;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'Keine Änderungen angegeben' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('photos')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('Photo update error:', error);
            return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
        }

        return NextResponse.json({
            id: data.id,
            taskId: data.task_id,
            fileUrl: data.file_url,
            visibility: data.visibility,
            caption: data.caption,
        });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// DELETE photo
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = session.user.role as Role;
    if (role === 'client') {
        return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    const { id } = await params;

    try {
        // Get photo to find file path
        const { data: photo, error: fetchError } = await supabase
            .from('photos')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !photo) {
            return NextResponse.json({ error: 'Foto nicht gefunden' }, { status: 404 });
        }

        // Only owner or architect can delete
        if (role !== 'architect' && photo.uploaded_by !== session.user.id) {
            return NextResponse.json({ error: 'Nicht berechtigt' }, { status: 403 });
        }

        // Try to delete from storage
        const fileUrl = photo.file_url as string;
        const bucketPrefix = '/storage/v1/object/public/photos/';
        const pathIndex = fileUrl.indexOf(bucketPrefix);
        if (pathIndex !== -1) {
            const storagePath = fileUrl.slice(pathIndex + bucketPrefix.length);
            await supabase.storage.from('photos').remove([storagePath]);
        }

        // Delete from DB
        const { error: deleteError } = await supabase
            .from('photos')
            .delete()
            .eq('id', id);

        if (deleteError) {
            console.error('Photo delete error:', deleteError);
            return NextResponse.json({ error: 'Fehler beim Löschen' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
