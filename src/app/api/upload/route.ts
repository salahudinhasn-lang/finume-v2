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
        const masterFolderId = process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID;
        const clientId = process.env.GOOGLE_CLIENT_ID;
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
        const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

        if (!masterFolderId || !clientId || !clientSecret || !refreshToken) {
            console.error("Google Drive Env Vars missing");
            // Fail if Drive is required. Since we removed reliable local fallback for Prod, we should return error.
            return NextResponse.json({ error: 'Server Configuration Error: Google Drive OAuth credentials missing' }, { status: 503 });
        }

        let userDriveFolderId = user?.googleDriveFolderId;

        // 1. Auto-Create User Folder if missing
        if (!userDriveFolderId && masterFolderId) {
            try {
                // Fetch full profile to get Company Name if possible
                const userFull = await prisma.user.findUnique({
                    where: { id: userId },
                    include: { clientProfile: true }
                });

                let folderName = `User_${userId}`;
                if (userFull) {
                    if (userFull.role === 'CLIENT' && userFull.clientProfile?.companyName) {
                        folderName = userFull.clientProfile.companyName;
                    } else if (userFull.name) {
                        folderName = userFull.name;
                    }
                }

                // Sanitize folder name (remove slashes just in case)
                folderName = folderName.replace(/[\/\\]/g, '-');

                const newFolder = await createFolder(folderName, masterFolderId);
                if (newFolder && newFolder.id) {
                    userDriveFolderId = newFolder.id;
                    // Update DB
                    await prisma.user.update({
                        where: { id: userId },
                        data: { googleDriveFolderId: userDriveFolderId }
                    });
                    console.log(`Auto-created Drive folder for user ${userId}: ${userDriveFolderId} (${folderName})`);
                }
            } catch (err) {
                console.error("Failed to auto-create missing Drive folder:", err);
            }
        }

        if (userDriveFolderId) {
            try {
                let targetFolderId = userDriveFolderId;

                // Client Logic: Subfolder by Date or Category
                if (user?.role === 'CLIENT') {
                    const category = formData.get('category') as string | null;

                    if (category === 'legal') {
                        // Legal Documents -> "Legal Entity Documents" folder
                        const legalFolderName = "Legal Entity Documents";
                        const legalFolder = await findSubfolder(userDriveFolderId, legalFolderName);

                        if (legalFolder && legalFolder.id) {
                            targetFolderId = legalFolder.id;
                        } else {
                            const newLegalFolder = await createFolder(legalFolderName, userDriveFolderId);
                            if (newLegalFolder && newLegalFolder.id) {
                                targetFolderId = newLegalFolder.id;
                            }
                        }
                    } else {
                        // Default / Daily Uploads
                        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
                        const dateFolder = await findSubfolder(userDriveFolderId, today);

                        if (dateFolder && dateFolder.id) {
                            targetFolderId = dateFolder.id;
                        } else {
                            // Create it
                            const newDateFolder = await createFolder(today, userDriveFolderId);
                            if (newDateFolder && newDateFolder.id) {
                                targetFolderId = newDateFolder.id;
                            }
                        }
                    }
                }

                const uploadedDriveFile = await uploadFileToDrive(buffer, filename, targetFolderId, file.type);
                if (uploadedDriveFile) {
                    driveFileUrl = uploadedDriveFile.webViewLink || null; // Link to view in Drive
                    driveFileId = uploadedDriveFile.id || undefined;
                    console.log(`Uploaded to Drive: ${driveFileUrl}`);
                }

            } catch (driveErr: any) {
                console.error("Google Drive Upload Failed:", driveErr);
                return NextResponse.json({ error: `Google Drive Upload Failed: ${driveErr.message}` }, { status: 500 });
            }
        }

        if (!driveFileUrl) {
            return NextResponse.json({ error: 'Upload failed: No URL returned from Drive' }, { status: 500 });
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
