
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { requestId, expertId, rating, comment } = await request.json();

        if (!requestId || !expertId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Review
        const review = await prisma.review.create({
            data: {
                requestId,
                expertId,
                rating: Number(rating),
                comment
            }
        });

        // 2. Recalculate Expert Stats
        const aggs = await prisma.review.aggregate({
            where: { expertId },
            _avg: { rating: true },
            _count: { rating: true }
        });

        const newRating = aggs._avg.rating || 0;
        const totalReviews = aggs._count.rating || 0;

        // 3. Update Expert Profile
        await prisma.expert.update({
            where: { id: expertId },
            data: {
                rating: newRating,
                totalReviews: totalReviews
            }
        });

        return NextResponse.json(review, { status: 201 });

    } catch (error) {
        console.error('Failed to submit review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
