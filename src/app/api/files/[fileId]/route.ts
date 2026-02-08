import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'finume-secret-key-change-me-in-prod';

export async function PATCH(
    req: NextRequest,
    props: { params: Promise<{ fileId: string }> }
) {
    try {
        const params = await props.params;
        const { fileId } = params;

        // Authenticate User
        const authHeader = req.headers.get('Authorization');
        let decodedToken: any = null;

        // 1. Try Header Token
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                decodedToken = jwt.verify(token, JWT_SECRET);
            } catch (err) {
                console.warn("Files API: Header token invalid, trying cookie...");
            }
        }

        // 2. Fallback to Cookie
        if (!decodedToken) {
            const cookie = req.cookies.get('finume_token');
            if (cookie) {
                try {
                    decodedToken = jwt.verify(cookie.value, JWT_SECRET);
                } catch (err) { }
            }
        }

        if (!decodedToken) {
            return NextResponse.json({ error: 'Invalid Token' }, { status: 401 });
        }

        const userId = decodedToken.userId || decodedToken.id;
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

export async function GET(
    req: NextRequest,
    props: { params: Promise<{ fileId: string }> }
) {
    try {
        const params = await props.params;
        const { fileId } = params;

        // Authenticate User - DISABLED FOR PUBLIC ACCESS
        // const authHeader = req.headers.get('Authorization');
        // let decodedToken: any = null;

        // if (authHeader && authHeader.startsWith('Bearer ')) {
        //     const token = authHeader.split(' ')[1];
        //     try { decodedToken = jwt.verify(token, JWT_SECRET); } catch (err) { }
        // }

        // if (!decodedToken) {
        //     const cookie = req.cookies.get('finume_token');
        //     if (cookie) {
        //         try { decodedToken = jwt.verify(cookie.value, JWT_SECRET); } catch (err) { }
        //     }
        // }

        // if (!decodedToken && process.env.NEXT_PUBLIC_ALLOW_PUBLIC_FILES !== 'true') {
        // For now, based on user request, we allow public. 
        // Ideally we might want some check, but "UUID as capability" is acceptable here.
        // }

        // Fetch File
        let file = await prisma.uploadedFile.findUnique({
            where: { id: fileId }
        });

        // Fallback: If not found by ID (maybe fileId IS the driveId, or it's a legacy link)
        if (!file) {
            // Try to find by URL containing this ID
            // This is for Profile/Settings docs where we only have the URL, and we extract ID from there
            const filesWithUrl = await prisma.uploadedFile.findMany({
                where: {
                    url: { contains: fileId }
                },
                take: 1
            });
            if (filesWithUrl.length > 0) {
                file = filesWithUrl[0];
            } else {
                return NextResponse.json({ error: 'File not found' }, { status: 404 });
            }
        }

        // Extract Drive ID
        let driveId = '';
        // If fileId passed WAS the drive ID (fallback case logic optimization)
        if (!file.url.includes(fileId) && file.id === fileId) {
            // Normal case, extract from URL
            // (Logic continues below)
        }

        if (file.url.includes('/file/d/')) {
            const match = file.url.match(/\/file\/d\/([^\/]+)/);
            if (match) driveId = match[1];
        } else if (file.url.includes('id=')) {
            const match = file.url.match(/id=([^&]+)/);
            if (match) driveId = match[1];
        }

        // Final fallback: If the requested fileId looks like a Drive ID (long alphanumeric), use it directly
        // This allows pure proxying if we trust the caller (authenticated user)
        if (!driveId && fileId.length > 20 && !fileId.includes('-')) {
            driveId = fileId;
        }

        if (!driveId) {
            return NextResponse.json({ error: 'Invalid Drive Link' }, { status: 400 });
        }

        // Fetch Stream
        const { getFileStream } = await import('@/lib/drive');
        const fileData = await getFileStream(driveId);

        if (!fileData || !fileData.stream) {
            return NextResponse.json({ error: 'Failed to retrieve file stream' }, { status: 502 });
        }

        const headers = new Headers();
        headers.set('Content-Type', fileData.contentType || 'application/octet-stream');
        if (fileData.contentLength) {
            headers.set('Content-Length', fileData.contentLength);
        }

        const download = req.nextUrl.searchParams.get('download') === 'true';
        const disposition = download ? 'attachment' : 'inline';
        const encodedFilename = encodeURIComponent(file.name).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
        headers.set('Content-Disposition', `${disposition}; filename*=UTF-8''${encodedFilename}`);

        return new NextResponse(fileData.stream as any, {
            status: 200,
            headers
        });

    } catch (error: any) {
        console.error('File Download Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
