import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createUser } from '@/lib/users';
import { Role } from '@/types';
import { createUserSchema, paginationSchema, formatZodError } from '@/lib/validations';
import type { PaginatedResponse } from '@/lib/validations';
import { apiWriteRateLimit, rateLimitResponse } from '@/lib/rate-limit';

// GET users (architect or client, paginated)
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || (session.user.role !== 'architect' && session.user.role !== 'client')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pageParsed = paginationSchema.safeParse({
        page: searchParams.get('page') ?? 1,
        limit: searchParams.get('limit') ?? 50,
    });
    const { page, limit } = pageParsed.success ? pageParsed.data : { page: 1, limit: 50 };
    const offset = (page - 1) * limit;

    try {
        const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });
        const total = count ?? 0;

        const { data, error } = await supabase
            .from('users')
            .select('id, email, name, role, phone, company, avatar_url, created_at')
            .order('created_at', { ascending: true })
            .range(offset, offset + limit - 1);

        if (error) {
            console.error('Users fetch error:', error);
            return NextResponse.json({ error: 'Fehler beim Laden der Benutzer' }, { status: 500 });
        }

        const users = (data || []).map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role as Role,
            phone: u.phone,
            company: u.company,
            avatarUrl: u.avatar_url,
            createdAt: u.created_at,
        }));

        const response: PaginatedResponse<typeof users[number]> = {
            data: users,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };

        return NextResponse.json(response);
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// POST create new user (architect only)
export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'architect') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { success } = await apiWriteRateLimit.limit(session.user.id);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = createUserSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: formatZodError(parsed.error) }, { status: 400 });
        }

        const { email, password, name, role, projectIds, tradeIds } = parsed.data;

        const newUser = await createUser(
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
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
