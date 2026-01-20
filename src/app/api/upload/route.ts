import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { uploadFileToDrive, createFolder, findSubfolder } from '@/lib/drive';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export async function POST(req: NextRequest) {
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

        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

        // Fetch User to get Drive Folder ID
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { googleDriveFolderId: true, role: true }
        });

        let driveFileUrl: string | null = null;
        let driveFileId: string | undefined;

        // --- Google Drive Logic ---
        if (user?.googleDriveFolderId) {
            try {
                let targetFolderId = user.googleDriveFolderId;

                // Client Logic: Subfolder by Date
                if (user.role === 'CLIENT') {
                    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                    const dateFolder = await findSubfolder(user.googleDriveFolderId, today);

                    if (dateFolder && dateFolder.id) {
                        targetFolderId = dateFolder.id;
                    } else {
                        // Create it
                        const newDateFolder = await createFolder(today, user.googleDriveFolderId);
                        if (newDateFolder && newDateFolder.id) {
                            targetFolderId = newDateFolder.id;
                        }
                    }
                }

                const uploadedDriveFile = await uploadFileToDrive(buffer, filename, targetFolderId, file.type);
                if (uploadedDriveFile) {
                    driveFileUrl = uploadedDriveFile.webViewLink; // Link to view in Drive
                    driveFileId = uploadedDriveFile.id;
                    console.log(`Uploaded to Drive: ${driveFileUrl}`);
                }

            } catch (driveErr) {
                console.error("Google Drive Upload Failed, falling back to local:", driveErr);
            }
        }
        // --------------------------

        // Fallback or Local Mirror (Optional: currently we do fallback if drive fails OR if no drive ID)
        if (!driveFileUrl) {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            const filePath = path.join(uploadDir, filename);
            await fs.promises.writeFile(filePath, buffer);
            driveFileUrl = `/uploads/${filename}`;
        }

        return NextResponse.json({
            url: driveFileUrl,
            name: file.name,
            size: file.size,
            type: file.type,
            driveId: driveFileId // Optional extra info
        });

    } catch (error) {
        console.error('Upload Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
