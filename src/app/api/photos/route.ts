import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { Role } from '@/types';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

// GET photos (filtered by taskId query param)
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    try {
        let query = supabase.from('photos').select('*, users!uploaded_by(name)');

        if (taskId) {
            query = query.eq('task_id', taskId);
        }

        query = query.order('created_at', { ascending: false });

        const { data, error } = await query;

        if (error) {
            console.error('Photos fetch error:', error);
            return NextResponse.json({ error: 'Fehler beim Laden der Fotos' }, { status: 500 });
        }

        const role = session.user.role as Role;
        const photos = (data || [])
            .filter((p: any) => role !== 'client' || p.visibility === 'client')
            .map((p: any) => ({
                id: p.id,
                taskId: p.task_id,
                fileUrl: p.file_url,
                thumbnailUrl: p.thumbnail_url,
                uploadedBy: p.uploaded_by,
                uploadedByName: p.users?.name,
                uploadedAt: p.created_at,
                visibility: p.visibility,
                caption: p.caption,
            }));

        return NextResponse.json(photos);
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// POST upload photo
export async function POST(request: NextRequest) {
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

    try {
        const formData = await request.formData();
        const file = formData.get('file') as File | null;
        const taskId = formData.get('taskId') as string;
        const visibility = (formData.get('visibility') as string) || 'internal';
        const caption = formData.get('caption') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'Keine Datei angegeben' }, { status: 400 });
        }

        if (!taskId) {
            return NextResponse.json({ error: 'Task-ID ist erforderlich' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'Nur Bilddateien erlaubt' }, { status: 400 });
        }

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Datei zu groß (max. 10 MB)' }, { status: 400 });
        }

        // Validate visibility
        if (!['internal', 'client'].includes(visibility)) {
            return NextResponse.json({ error: 'Ungültige Sichtbarkeit' }, { status: 400 });
        }

        // Verify task exists
        const { data: taskData, error: taskError } = await supabase
            .from('tasks')
            .select('id')
            .eq('id', taskId)
            .single();

        if (taskError || !taskData) {
            return NextResponse.json({ error: 'Aufgabe nicht gefunden' }, { status: 404 });
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop() || 'jpg';
        const fileName = `${taskId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

        const arrayBuffer = await file.arrayBuffer();
        const { error: uploadError } = await supabase.storage
            .from('photos')
            .upload(fileName, arrayBuffer, {
                contentType: file.type,
                upsert: false,
            });

        if (uploadError) {
            console.error('Storage upload error:', uploadError);
            return NextResponse.json({ error: 'Fehler beim Hochladen der Datei' }, { status: 500 });
        }

        // Get public URL
        const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName);
        const fileUrl = urlData.publicUrl;

        // Insert into DB
        const { data: photo, error: insertError } = await supabase
            .from('photos')
            .insert({
                task_id: taskId,
                file_url: fileUrl,
                thumbnail_url: fileUrl, // Use same URL for now
                uploaded_by: session.user.id,
                visibility,
                caption: caption || null,
            })
            .select()
            .single();

        if (insertError) {
            console.error('Photo insert error:', insertError);
            return NextResponse.json({ error: 'Fehler beim Speichern des Fotos' }, { status: 500 });
        }

        return NextResponse.json({
            id: photo.id,
            taskId: photo.task_id,
            fileUrl: photo.file_url,
            thumbnailUrl: photo.thumbnail_url,
            uploadedBy: photo.uploaded_by,
            uploadedAt: photo.created_at,
            visibility: photo.visibility,
            caption: photo.caption,
        }, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
