import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET || 'finume-secret-key-change-me-in-prod';
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export async function signToken(payload: any): Promise<string> {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // Set token expiration
        .sign(key);
}

export async function verifyToken(token: string): Promise<any> {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (e) {
        console.error('[Auth] Token verification failed:', e);
        return null;
    }
}

export async function getSession() {
    const cookieStore = cookies();
    // Get cookie. Note: cookies() is async in newer Next.js but safe to await in older. 
    // Next 15: cookies() returns a Promise<ReadonlyRequestCookies>. 
    // Let's assume standard await usage for compat.
    const token = (await cookieStore).get('finume_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function setSession(token: string) {
    const cookieStore = await cookies();
    cookieStore.set('finume_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
    });
}


export async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('finume_token');
}

export async function getUserFromToken(req: NextRequest) {
    const token = req.cookies.get('finume_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}
