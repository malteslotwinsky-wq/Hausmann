import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';
import { loginRateLimit, rateLimitResponse } from '@/lib/rate-limit';
import { NextRequest } from 'next/server';

const nextAuth = NextAuth(authOptions);

export { nextAuth as GET };

export async function POST(request: NextRequest, context: { params: any }) {
    // Rate limit login attempts (callback/credentials)
    if (request.nextUrl.pathname.includes('/callback/credentials')) {
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || '127.0.0.1';

        const { success } = await loginRateLimit.limit(ip);
        if (!success) {
            return rateLimitResponse();
        }
    }

    return nextAuth(request as any, context);
}
