import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export interface AuthUser {
    id: string;
    email?: string;
    role: string;
}

export function getJwtSecretString(): string {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret.length < 16) {
        throw new Error('JWT_SECRET is not configured (or too short). Set a strong random value in the environment.');
    }
    return secret;
}

export function getJwtSecret(): Uint8Array {
    return new TextEncoder().encode(getJwtSecretString());
}

export async function getAuthUser(req: Request): Promise<AuthUser | null> {
    try {
        let token: string | null = null;
        const cookieHeader = req.headers.get('cookie') || '';
        const match = cookieHeader.match(/(?:^|;\s*)finume_token=([^;]+)/);
        if (match) { token = decodeURIComponent(match[1]); }
        if (!token) {
            const authHeader = req.headers.get('authorization') || '';
            if (authHeader.startsWith('Bearer ')) { token = authHeader.slice(7).trim(); }
        }
        if (!token) return null;
        const { payload } = await jwtVerify(token, getJwtSecret(), { algorithms: ['HS256'] });
        const id = (payload.userId as string) || (payload.id as string);
        const role = payload.role as string;
        if (!id || !role) return null;
        return { id, role, email: payload.email as string | undefined };
    } catch (e) {
        return null;
    }
}

export async function requireUser(req: Request): Promise<AuthUser | NextResponse> {
    const user = await getAuthUser(req);
    if (!user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    return user;
}

export async function requireRole(req: Request, roles: string[]): Promise<AuthUser | NextResponse> {
    const user = await getAuthUser(req);
    if (!user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
    if (!roles.includes(user.role)) { return NextResponse.json({ error: 'Forbidden' }, { status: 403 }); }
    return user;
}
