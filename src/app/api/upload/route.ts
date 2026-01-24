import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { uploadFileToDrive, createFolder, findSubfolder } from '@/lib/drive';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

export async function POST(req: NextRequest) {
    try {
        // Authenticate User
        console.log("Upload API: Received request");
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
        const userRole = decodedToken.role; // Assuming role is in token, otherwise fetch user

        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const requestId = formData.get('requestId') as string | null;
        const category = formData.get('category') as string | null; // e.g. 'legal', 'profile'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        // REMOVED STRICT CHECK FOR requestId

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename: remove special chars, keep extension
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${cleanName}`;

        let request: any = null;
        let clientUser: any = null;

        // Fetch user details to know name/company
        const userRecord = await prisma.user.findUnique({
            where: { id: userId },
            include: { clientProfile: true, expertProfile: true }
        });

        if (!userRecord) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (requestId) {
            request = await prisma.request.findUnique({
                where: { id: requestId },
                include: {
                    client: { include: { user: true } },
                    assignedExpert: true
                }
            });
            if (!request) {
                return NextResponse.json({ error: 'Request not found' }, { status: 404 });
            }
            clientUser = request.client?.user;
        } else {
            // No request, likely settings upload
            clientUser = userRecord;
        }

        // --- Google Drive Logic ---
        const masterFolderId = process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID;
        if (!masterFolderId) {
            return NextResponse.json({ error: 'Server Config Error: Drive Master Folder ID missing' }, { status: 503 });
        }

        let currentFolderId = masterFolderId;

        // LEVEL 1 & 2: Identity Folder (Company/User Name)
        // Check if we already have the folder ID stored (Best Case)
        if (userRecord.googleDriveFolderId) {
            currentFolderId = userRecord.googleDriveFolderId;
            console.log(`[Drive] Using stored Identity Folder ID: ${currentFolderId}`);
        } else {
            // Not found on user, we need to find or create it.
            // 1. Determine Category (Client vs Expert)
            const roleFolder = userRecord.role === 'CLIENT' ? 'Client' : 'Expert';

            let categoryFolderId = masterFolderId;
            const categoryFolder = await findSubfolder(masterFolderId, roleFolder);
            if (categoryFolder && categoryFolder.id) {
                categoryFolderId = categoryFolder.id;
            } else {
                const newCat = await createFolder(roleFolder, masterFolderId);
                if (newCat && newCat.id) categoryFolderId = newCat.id;
            }

            // 2. Determine Identity Name
            let identityName = "Unknown";
            if (userRecord.role === 'CLIENT') {
                identityName = userRecord.clientProfile?.companyName || userRecord.name;
            } else {
                identityName = userRecord.expertProfile?.name || userRecord.name;
            }
            identityName = identityName.replace(/[\/\\]/g, '-'); // Sanitize

            // 3. Find/Create Identity Folder
            const identityFolder = await findSubfolder(categoryFolderId, identityName);
            if (identityFolder && identityFolder.id) {
                currentFolderId = identityFolder.id;
            } else {
                const newFolder = await createFolder(identityName, categoryFolderId);
                if (!newFolder?.id) throw new Error("Failed to create Identity folder");
                currentFolderId = newFolder.id;
            }

            // 4. Save for next time
            await prisma.user.update({
                where: { id: userId },
                data: { googleDriveFolderId: currentFolderId }
            });
        }

        // LEVEL 3: Context Branching (Request vs Settings)
        if (requestId && request) {
            // BRANCH A: Request Upload -> [Request ID] -> [Date]
            const requestFolderName = request.displayId || `REQ-${request.id.slice(0, 8)}`;

            let requestFolderId = currentFolderId;
            const reqFolder = await findSubfolder(currentFolderId, requestFolderName);
            if (reqFolder?.id) {
                requestFolderId = reqFolder.id;
            } else {
                const newFolder = await createFolder(requestFolderName, currentFolderId);
                if (!newFolder?.id) throw new Error("Failed to create Request folder");
                requestFolderId = newFolder.id;
            }

            // Date Folder
            const today = new Date().toISOString().split('T')[0];
            const dateFolder = await findSubfolder(requestFolderId, today);
            if (dateFolder?.id) {
                currentFolderId = dateFolder.id;
            } else {
                const newFolder = await createFolder(today, requestFolderId);
                if (!newFolder?.id) throw new Error("Failed to create Date folder");
                currentFolderId = newFolder.id;
            }

        } else {
            // BRANCH B: Settings Upload -> [Legal_Entity_Files] or [Other]
            // Default to Legal_Entity_Files for settings uploads
            const folderName = (category === 'legal' || !category) ? 'Legal_Entity_Files' : 'Other_Files';

            const legalFolder = await findSubfolder(currentFolderId, folderName);
            if (legalFolder?.id) {
                currentFolderId = legalFolder.id;
            } else {
                const newFolder = await createFolder(folderName, currentFolderId);
                if (!newFolder?.id) throw new Error(`Failed to create ${folderName} folder`);
                currentFolderId = newFolder.id;
            }
        }


        // Upload File
        const uploadedDriveFile = await uploadFileToDrive(buffer, filename, currentFolderId, file.type);
        if (!uploadedDriveFile || !uploadedDriveFile.webViewLink) {
            throw new Error("Drive upload failed");
        }

        // --- Database Logic ---

        const newFile = await prisma.uploadedFile.create({
            data: {
                name: file.name,
                size: file.size.toString(),
                type: file.type,
                url: uploadedDriveFile.webViewLink,
                uploadedById: userId,
                requestId: requestId || undefined, // Can be undefined now
                category: category || undefined
            }
        });

        // Expert Task Logic (Only if associated with a request)
        if (requestId && request && request.assignedExpertId) {
            const today = new Date().toISOString().split('T')[0];
            // Check if there is already an open task for "Review files from [Today]"
            const taskTile = `Review files uploaded by client on ${today}`;

            const existingTask = await prisma.expertTask.findFirst({
                where: {
                    requestId: request.id,
                    expertId: request.assignedExpertId,
                    description: taskTile,
                    status: 'PENDING'
                }
            });

            if (!existingTask) {
                await prisma.expertTask.create({
                    data: {
                        description: taskTile,
                        status: 'PENDING',
                        requestId: request.id,
                        expertId: request.assignedExpertId,
                    }
                });
            }
        }

        return NextResponse.json({
            success: true,
            url: uploadedDriveFile.webViewLink,
            name: file.name,
            driveId: uploadedDriveFile.id
        });

    } catch (error: any) {
        console.error('Upload Error', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
