import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Login: 5 attempts per 60 seconds per IP
export const loginRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '60 s'),
    prefix: 'rl:login',
});

// API writes (POST/PUT/PATCH/DELETE): 30 requests per 60 seconds per user
export const apiWriteRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(30, '60 s'),
    prefix: 'rl:api-write',
});

// Password reset: 3 requests per 15 minutes per IP
export const passwordResetRateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, '900 s'),
    prefix: 'rl:pw-reset',
});

export function rateLimitResponse() {
    return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' },
        { status: 429 }
    );
}
