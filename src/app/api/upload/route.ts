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

        // LEVEL 1: "Client" VS "Expert"
        // Determine main branch based on who is uploading or the context
        // User asked: "if client upload... goes to Client", "if expert upload... goes to Expert"

        // However, usually files adhere to the OWNER of the file context. 
        // If an Expert uploads a file TO A CLIENT REQUEST, should it go to Client folder or Expert folder?
        // Usually Client folder is better for case management.
        // But let's stick STRICTLY to user instruction: "if the expert upload it goes to ... Expert"

        const mainBranchName = userRole === 'CLIENT' ? 'Client' : 'Expert';
        // OR simply use the role from the userRecord we fetched
        const roleFolder = userRecord.role === 'CLIENT' ? 'Client' : 'Expert';

        let targetRootFolderId = currentFolderId;

        const rootTypeFolder = await findSubfolder(targetRootFolderId, roleFolder);
        if (rootTypeFolder?.id) {
            targetRootFolderId = rootTypeFolder.id;
        } else {
            const newFolder = await createFolder(roleFolder, targetRootFolderId);
            if (!newFolder?.id) throw new Error(`Failed to create ${roleFolder} folder`);
            targetRootFolderId = newFolder.id;
        }
        currentFolderId = targetRootFolderId;

        // Level 2: Name / Company Name
        let identityName = "Unknown";
        if (roleFolder === 'Client') {
            identityName = userRecord.clientProfile?.companyName || userRecord.name;
        } else {
            identityName = userRecord.expertProfile?.name || userRecord.name;
        }
        identityName = identityName.replace(/[\/\\]/g, '-'); // Sanitize

        // Check for stored ID on User (applies to both Client and Expert now)
        if (userRecord.googleDriveFolderId && currentFolderId !== masterFolderId) {
            // We only use the stored ID if we are sure it's valid? 
            // Actually, the stored ID IS the identity folder. 
            // Logic check: The code above sets currentFolderId to 'Client' or 'Expert' category folder.
            // But googleDriveFolderId stores the IDENTITY folder (e.g. "Khaled Genena").
            // So we can skip searching if we have it.

            // Wait, if we use the stored ID, we bypass the category folder check? 
            // Yes, because the ID is unique globally in Drive. 
            // But we just did the category folder check above. That's fine, it ensures structure exists.

            // Let's optimize: If we have userRecord.googleDriveFolderId, we can just use it directly!
            // BUT, we want to ensure it's still inside the correct hierarchy? 
            // Drive IDs don't change location easily. Trust the ID.
        }

        // BETTER LOGIC:
        // Use stored ID if available.
        if (userRecord.googleDriveFolderId) {
            currentFolderId = userRecord.googleDriveFolderId;
            console.log(`[Drive] Using stored Identity Folder ID: ${currentFolderId}`);
        } else {
            // Not found, we must find/create inside currentFolderId (which is Level 1: Client/Expert)
            const identityFolder = await findSubfolder(currentFolderId, identityName);

            if (identityFolder && identityFolder.id) {
                currentFolderId = identityFolder.id;
                // Found it, persist it!
                await prisma.user.update({
                    where: { id: userId },
                    data: { googleDriveFolderId: currentFolderId }
                });
            } else {
                const newFolder = await createFolder(identityName, currentFolderId);
                if (!newFolder?.id) throw new Error("Failed to create Identity folder");
                currentFolderId = newFolder.id;

                // Created it, persist it!
                await prisma.user.update({
                    where: { id: userId },
                    data: { googleDriveFolderId: currentFolderId }
                });
                console.log(`[Drive] Linked NEW Identity folder to User: ${currentFolderId}`);
            }
        }

        // LEVEL 3: Context (Request ID or "Profile Documents")
        let contextFolderName = "General";
        if (requestId && request) {
            contextFolderName = request.displayId || `REQ-${request.id.slice(0, 8)}`;
        } else {
            contextFolderName = "Profile_Documents";
        }

        const contextFolder = await findSubfolder(currentFolderId, contextFolderName);
        if (contextFolder?.id) {
            currentFolderId = contextFolder.id;
        } else {
            const newFolder = await createFolder(contextFolderName, currentFolderId);
            if (!newFolder?.id) throw new Error("Failed to create Context folder");
            currentFolderId = newFolder.id;
        }

        // LEVEL 4: Date (Optional, but good for organization)
        // User said "same old logic", old logic had date.
        /* 
        const today = new Date().toISOString().split('T')[0];
        const dateFolder = await findSubfolder(currentFolderId, today);
        if (dateFolder?.id) {
             currentFolderId = dateFolder.id;
        } else {
             const newFolder = await createFolder(today, currentFolderId);
             if (!newFolder?.id) throw new Error("Failed to create Date folder");
             currentFolderId = newFolder.id;
        }
        */
        // Actually, for Profile Documents, separating by date might be annoying. 
        // For Requests it makes sense.
        // Let's keep it clean: Request -> File. Profile -> File.
        // Unless user strictly asked for "same old logic" recursively. 
        // "with the same old logic" likely implies the [Company > Request > Date] structure *inside* the Client folder.
        // I will add the date folder ONLY if it is a REQUEST.

        if (requestId) {
            const today = new Date().toISOString().split('T')[0];
            const dateFolder = await findSubfolder(currentFolderId, today);
            if (dateFolder?.id) {
                currentFolderId = dateFolder.id;
            } else {
                const newFolder = await createFolder(today, currentFolderId);
                if (!newFolder?.id) throw new Error("Failed to create Date folder");
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
