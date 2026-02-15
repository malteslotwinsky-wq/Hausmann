import 'server-only';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

function createRedis() {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) return null;
    return new Redis({ url, token });
}

function createRateLimit(prefix: string, requests: number, window: string) {
    const redis = createRedis();
    if (!redis) return null;
    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(requests, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
        prefix,
    });
}

// Lazy singletons - only created when keys are available
let _loginRL: Ratelimit | null | undefined;
let _apiWriteRL: Ratelimit | null | undefined;
let _pwResetRL: Ratelimit | null | undefined;

function getLoginRateLimit() {
    if (_loginRL === undefined) _loginRL = createRateLimit('rl:login', 5, '60 s');
    return _loginRL;
}

function getApiWriteRateLimit() {
    if (_apiWriteRL === undefined) _apiWriteRL = createRateLimit('rl:api-write', 30, '60 s');
    return _apiWriteRL;
}

function getPasswordResetRateLimit() {
    if (_pwResetRL === undefined) _pwResetRL = createRateLimit('rl:pw-reset', 3, '900 s');
    return _pwResetRL;
}

export const loginRateLimit = {
    async limit(key: string) {
        const rl = getLoginRateLimit();
        if (!rl) return { success: true };
        return rl.limit(key);
    },
};

export const apiWriteRateLimit = {
    async limit(key: string) {
        const rl = getApiWriteRateLimit();
        if (!rl) return { success: true };
        return rl.limit(key);
    },
};

export const passwordResetRateLimit = {
    async limit(key: string) {
        const rl = getPasswordResetRateLimit();
        if (!rl) return { success: true };
        return rl.limit(key);
    },
};

export function rateLimitResponse() {
    return NextResponse.json(
        { error: 'Zu viele Anfragen. Bitte warten Sie einen Moment.' },
        { status: 429 }
    );
}
