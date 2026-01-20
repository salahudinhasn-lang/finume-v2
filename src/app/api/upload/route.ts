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
        console.log("Upload API: Auth Header:", authHeader ? "Present" : "Missing");

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.error("Upload API: Unauthorized - missing header");
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
        const requestId = formData.get('requestId') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }
        if (!requestId) {
            return NextResponse.json({ error: 'Request ID is required for this upload' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Clean filename: remove special chars, keep extension
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filename = `${Date.now()}-${cleanName}`;

        // Fetch Request & Client details
        const request = await prisma.request.findUnique({
            where: { id: requestId },
            include: {
                client: {
                    include: { user: true }
                },
                assignedExpert: true
            }
        });

        if (!request) {
            return NextResponse.json({ error: 'Request not found' }, { status: 404 });
        }

        // --- Google Drive Logic ---
        const masterFolderId = process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID;

        if (!masterFolderId) {
            return NextResponse.json({ error: 'Server Config Error: Drive Master Folder ID missing' }, { status: 503 });
        }

        let currentFolderId = masterFolderId;

        // Level 1: Company Folder
        // Use Company Name if Client, else User Name, else "Unknown_Client"
        let companyFolderName = "Unknown_Client";
        if (request.client && request.client.companyName) {
            companyFolderName = request.client.companyName;
        } else if (request.client && request.client.user?.name) { // accessible if we included user, but client object usually has companyName
            // If client.companyName is missing, we might need to fetch user, but let's assume valid client
            companyFolderName = `Client_${request.clientId}`;
        }
        companyFolderName = companyFolderName.replace(/[\/\\]/g, '-'); // Sanitize

        const companyFolder = await findSubfolder(currentFolderId, companyFolderName);
        if (companyFolder && companyFolder.id) {
            currentFolderId = companyFolder.id;
        } else {
            const newFolder = await createFolder(companyFolderName, currentFolderId);
            if (!newFolder || !newFolder.id) throw new Error("Failed to create Company folder");
            currentFolderId = newFolder.id;
        }

        // Level 2: Request Folder (Display ID)
        const requestFolderName = request.displayId || `REQ-${request.id.slice(0, 8)}`;
        const requestFolder = await findSubfolder(currentFolderId, requestFolderName);
        if (requestFolder && requestFolder.id) {
            currentFolderId = requestFolder.id;
        } else {
            const newFolder = await createFolder(requestFolderName, currentFolderId);
            if (!newFolder || !newFolder.id) throw new Error("Failed to create Request folder");
            currentFolderId = newFolder.id;
        }

        // Level 3: Date Folder (YYYY-MM-DD)
        const today = new Date().toISOString().split('T')[0];
        const dateFolder = await findSubfolder(currentFolderId, today);
        if (dateFolder && dateFolder.id) {
            currentFolderId = dateFolder.id;
        } else {
            const newFolder = await createFolder(today, currentFolderId);
            if (!newFolder || !newFolder.id) throw new Error("Failed to create Date folder");
            currentFolderId = newFolder.id;
        }

        // Upload File
        const uploadedDriveFile = await uploadFileToDrive(buffer, filename, currentFolderId, file.type);
        if (!uploadedDriveFile || !uploadedDriveFile.webViewLink) {
            throw new Error("Drive upload failed");
        }

        // --- Database Logic ---

        // 1. Find or Create FileBatch for this Request + Date? 
        // Logic says "create task for expert". Maybe one task per batch?
        // Let's create a NEW batch for this upload session if one doesn't exist for today, or just append.
        // Simplest: Create a FileBatch for this upload (or group uploads if sequential, but here we process one by one).
        // To avoid spamming tasks, we can check if there is already a PENDING task for this request created TODAY.

        let relatedBatchId = null;

        // Create UploadedFile record
        // We need a batch. Let's find recent batch or create one.
        // For simplicity, let's create a new Batch for "Daily Uploads - [Date]"

        const batchName = `Uploads ${today}`;
        // Try to find existing batch for this request & date? 
        // For now, simple approach: Create Batch if not exists, else append.
        // Prisma doesn't strictly require Batch for UploadedFile (it's optional in schema? Check schema).
        // Schema: `fileBatch FileBatch?` -> Yes optional.

        const newFile = await prisma.uploadedFile.create({
            data: {
                name: file.name,
                size: file.size.toString(),
                type: file.type,
                url: uploadedDriveFile.webViewLink,
                uploadedById: userId,
                requestId: request.id
            }
        });

        // 2. Expert Task Logic
        // "I want to enevolp every upload the client make as a task for the expert"
        if (request.assignedExpertId) {
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
                        // relatedBatchId: ... (link if we had batch)
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
