import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createMessageSchema, paginationSchema, formatZodError } from '@/lib/validations';
import type { PaginatedResponse } from '@/lib/validations';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

// GET messages for current user (paginated)
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user } = session;
    const { searchParams } = new URL(request.url);

    const pageParsed = paginationSchema.safeParse({
        page: searchParams.get('page') ?? 1,
        limit: searchParams.get('limit') ?? 50,
    });
    const { page, limit } = pageParsed.success ? pageParsed.data : { page: 1, limit: 50 };
    const offset = (page - 1) * limit;

    try {
        const filter = `sender_id.eq.${user.id},recipient_id.eq.${user.id}`;

        // Count
        const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .or(filter);
        const total = count ?? 0;

        // Fetch page
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(filter)
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Messages fetch error:', error);
            return NextResponse.json({ error: 'Fehler beim Laden der Nachrichten' }, { status: 500 });
        }

        const response: PaginatedResponse<(typeof messages)[number]> = {
            data: messages || [],
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };

        return NextResponse.json(response);
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// POST new message
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = createMessageSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const { recipientId, content } = parsed.data;

        // Verify recipient exists
        const { data: recipient } = await supabase
            .from('users')
            .select('id')
            .eq('id', recipientId)
            .single();

        if (!recipient) {
            return NextResponse.json({ error: 'Empfänger nicht gefunden' }, { status: 404 });
        }

        const { data, error } = await supabase
            .from('messages')
            .insert({
                sender_id: session.user.id,
                recipient_id: recipientId,
                content: content,
                read: false
            })
            .select()
            .single();

        if (error) {
            console.error('Message creation error:', error);
            return NextResponse.json({ error: 'Fehler beim Senden der Nachricht' }, { status: 500 });
        }

        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
