import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth';

// Define protected routes and allowed roles
const PROTECTED_ROUTES = [
    { path: '/admin', roles: ['SUPER_ADMIN', 'ADMIN'] },
    { path: '/expert', roles: ['EXPERT'] },
    { path: '/client', roles: ['CLIENT'] },
];

export async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // 1. Check if path is protected
    const routeConfig = PROTECTED_ROUTES.find(r => path.startsWith(r.path));
    if (!routeConfig) {
        return NextResponse.next();
    }

    // 2. Verify Session
    const token = req.cookies.get('finume_token')?.value;
    if (!token) {
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        url.searchParams.set('redirect', path);
        return NextResponse.redirect(url);
    }

    const payload = await verifyToken(token);
    if (!payload) {
        // Invalid token
        const url = req.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // 3. Check Role Access
    // @ts-ignore - payload.role is string from JWT
    if (!routeConfig.roles.includes(payload.role)) {
        // Unauthorized
        // Redirect to their appropriate dashboard or unauthorized page
        const url = req.nextUrl.clone();
        // @ts-ignore
        if (payload.role === 'CLIENT') url.pathname = '/client';
        // @ts-ignore
        else if (payload.role === 'EXPERT') url.pathname = '/expert';
        // @ts-ignore
        else if (['ADMIN', 'SUPER_ADMIN'].includes(payload.role)) url.pathname = '/admin';
        else url.pathname = '/'; // Fallback

        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes - handled separately or protected inside)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
