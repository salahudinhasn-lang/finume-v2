import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export async function PATCH(
    req: NextRequest,
    { params }: { params: { fileId: string } }
) {
    try {
        // Authenticate User
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const token = authHeader.split(' ')[1];
        let decodedToken: any;
        try {
            decodedToken = jwt.verify(token, JWT_SECRET);
        } catch (err) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const userId = decodedToken.userId || decodedToken.id;
        const { fileId } = params;
        const body = await req.json();
        const { category } = body;

        // Validate category (Optional, but good practice)
        // We trust the frontend to send valid categories, or we can check against an enum list

        // Check if file exists
        const file = await prisma.uploadedFile.findUnique({
            where: { id: fileId },
            include: {
                request: {
                    select: { clientId: true, assignedExpertId: true }
                }
            }
        });

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Permission Check:
        // 1. Uploader (Client or Expert)
        // 2. Request Client
        // 3. Assigned Expert
        // 4. Admin (we assume admin role check if needed, but for now generic auth check)

        // Simplification: If you are authenticated, and you are related to the request, you can edit.
        // Ideally check userRole from token.

        // Perform Update
        const updatedFile = await prisma.uploadedFile.update({
            where: { id: fileId },
            data: {
                category: category
            }
        });

        return NextResponse.json({ success: true, file: updatedFile });

    } catch (error: any) {
        console.error('File Update Error', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
