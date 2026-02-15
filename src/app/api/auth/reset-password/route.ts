import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/email';
import { passwordResetRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const requestSchema = z.object({
    email: z.string().email(),
});

const resetSchema = z.object({
    token: z.string().min(1),
    password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
});

// POST /api/auth/reset-password - Request password reset
export async function POST(request: NextRequest) {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || request.headers.get('x-real-ip')
        || '127.0.0.1';

    const { success } = await passwordResetRateLimit.limit(ip);
    if (!success) return rateLimitResponse();

    try {
        const body = await request.json();
        const parsed = requestSchema.safeParse(body);

        if (!parsed.success) {
            // Always return success to prevent email enumeration
            return NextResponse.json({ message: 'Falls ein Konto existiert, wurde eine E-Mail gesendet.' });
        }

        const { email } = parsed.data;

        // Check if user exists
        const { data: user } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', email)
            .single();

        if (!user) {
            // Don't reveal whether email exists
            return NextResponse.json({ message: 'Falls ein Konto existiert, wurde eine E-Mail gesendet.' });
        }

        // Generate reset token
        const token = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

        // Store token in DB
        // First, delete any existing tokens for this user
        await supabase
            .from('password_reset_tokens')
            .delete()
            .eq('user_id', user.id);

        const { error: insertError } = await supabase
            .from('password_reset_tokens')
            .insert({
                user_id: user.id,
                token,
                expires_at: expiresAt,
            });

        if (insertError) {
            console.error('Token insert error:', insertError);
            return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
        }

        // Build reset URL
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
        const resetUrl = `${baseUrl}/reset-password?token=${token}`;

        // Send email
        await sendPasswordResetEmail(user.email, token, resetUrl);

        return NextResponse.json({ message: 'Falls ein Konto existiert, wurde eine E-Mail gesendet.' });
    } catch (err) {
        console.error('Password reset request error:', err);
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}

// PUT /api/auth/reset-password - Execute password reset with token
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const parsed = resetSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json({ error: 'Ungültige Eingabe' }, { status: 400 });
        }

        const { token, password } = parsed.data;

        // Find valid token
        const { data: tokenData } = await supabase
            .from('password_reset_tokens')
            .select('user_id, expires_at')
            .eq('token', token)
            .single();

        if (!tokenData) {
            return NextResponse.json({ error: 'Ungültiger oder abgelaufener Link' }, { status: 400 });
        }

        // Check expiry
        if (new Date(tokenData.expires_at) < new Date()) {
            // Clean up expired token
            await supabase.from('password_reset_tokens').delete().eq('token', token);
            return NextResponse.json({ error: 'Link ist abgelaufen. Bitte erneut anfordern.' }, { status: 400 });
        }

        // Hash new password and update user
        const passwordHash = await bcrypt.hash(password, 10);

        const { error: updateError } = await supabase
            .from('users')
            .update({ password: passwordHash })
            .eq('id', tokenData.user_id);

        if (updateError) {
            console.error('Password update error:', updateError);
            return NextResponse.json({ error: 'Fehler beim Aktualisieren' }, { status: 500 });
        }

        // Delete used token
        await supabase.from('password_reset_tokens').delete().eq('token', token);

        return NextResponse.json({ message: 'Passwort erfolgreich geändert' });
    } catch {
        return NextResponse.json({ error: 'Interner Serverfehler' }, { status: 500 });
    }
}
