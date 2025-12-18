
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, {
                status: 404,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        if (user.password !== password) {
            return NextResponse.json({ error: 'Invalid password' }, {
                status: 401,
                headers: { 'Access-Control-Allow-Origin': '*' }
            });
        }

        // In a real app, return JWT here. For now, return user object.
        const { password: _, ...userWithoutPassword } = user;
        return NextResponse.json(userWithoutPassword, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' }
        });
    }
}
