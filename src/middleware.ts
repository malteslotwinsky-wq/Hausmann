import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/reset-password', '/api/auth'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public routes
    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    // Check for session token
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET
    });

    // Redirect to login if no token
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Role-based route protection
    const role = token.role as string;

    // Clients cannot access certain routes
    if (role === 'client') {
        const restrictedForClient = ['/tasks', '/activity', '/admin'];
        if (restrictedForClient.some(route => pathname.startsWith(route))) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    // Only architects can access admin
    if (role !== 'architect' && pathname.startsWith('/admin')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    // Contractors cannot access contacts page
    if (role === 'contractor' && pathname.startsWith('/contacts')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Match all routes except static files and api (except auth)
        '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'
    ],
};
