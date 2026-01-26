
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSession();
    if (!session || session.role !== 'CLIENT') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { requestId, expertId, rating, comment, expertReview, expertReviewComment, platformReview, platformReviewComment } = await request.json();

        if (!requestId || !expertId || !rating) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Create Review (Legacy Table - Keep for backward compatibility if needed, but we also save to Request)
        // We'll update the Request directly as per new requirement
        await prisma.request.update({
            where: { id: requestId },
            data: {
                expertReview: expertReview || rating,
                expertReviewComment: expertReviewComment || comment,
                platformReview: platformReview,
                platformReviewComment: platformReviewComment,
                // Also create the relation Review entry for legacy lookups
                review: {
                    create: {
                        expertId,
                        rating: Number(expertReview || rating),
                        comment: expertReviewComment || comment
                    }
                }
            }
        });

        // 2. Recalculate Expert Stats (Based on Request table now or Review table? Using Review table is safer for now as we just synced it)
        // Let's use the Review table for aggregation since we just added an entry there via relation
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

        return NextResponse.json({ success: true, newRating }, { status: 201 });

    } catch (error) {
        console.error('Failed to submit review:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
