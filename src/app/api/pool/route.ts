import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session || session.role !== 'EXPERT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Find requests that are pending assignment or where this expert is explicitly invited
        // "Marketplace" usually implies open pool.
        // Assuming PENDING_ASSIGNMENT is the status for open requests.
        const pool = await prisma.request.findMany({
            where: {
                OR: [
                    { status: 'PENDING_ASSIGNMENT' },
                    {
                        poolInvites: {
                            some: {
                                expertId: session.id, // Assuming session.id maps to User ID which maps to ExpertProfile.userId
                                status: 'INVITED'
                            }
                        }
                    }
                ]
            },
            include: {
                service: true,
                client: {
                    include: { user: { select: { email: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(pool);
    } catch (error) {
        console.error('Pool List Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
