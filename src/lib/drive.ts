import { google } from 'googleapis';

// These should be in your .env
// GOOGLE_CLIENT_EMAIL=...
// GOOGLE_PRIVATE_KEY=...  (Newlines replaced by \n)
// GOOGLE_DRIVE_MASTER_FOLDER_ID=...

const SCOPES = ['https://www.googleapis.com/auth/drive'];

export async function getDriveService() {
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
        console.error("Missing Google Drive Credentials");
        return null;
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: clientEmail,
            private_key: privateKey,
        },
        scopes: SCOPES,
    });

    return google.drive({ version: 'v3', auth });
}

export async function createFolder(folderName: string, parentId?: string) {
    const drive = await getDriveService();
    if (!drive) return null;

    try {
        const fileMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        if (parentId) {
            fileMetadata.parents = [parentId];
        } else if (process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID) {
            // Default to Master Folder if no parent specified
            fileMetadata.parents = [process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID];
        }

        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name, webViewLink',
        });

        // Permission: Share with Salahudin (User) so he can see it? 
        // Actually, if it is in the Master Shared Folder, he already inherits access!
        // So no need to explicitly add permission if we nest it correctly.

        return file.data;
    } catch (err) {
        console.error('Error creating folder:', err);
        return null;
    }
}

export async function uploadFileToDrive(fileBuffer: Buffer, fileName: string, folderId: string, mimeType: string) {
    const drive = await getDriveService();
    if (!drive) return null;

    try {
        const fileMetadata = {
            name: fileName,
            parents: [folderId],
        };
        const media = {
            mimeType: mimeType,
            body: (await import('stream')).Readable.from(fileBuffer),
        };

        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink',
        });
        return file.data;
    } catch (err) {
        console.error("Upload to Drive failed", err);
        throw err;
    }
}

export async function findSubfolder(parentFolderId: string, subfolderName: string) {
    const drive = await getDriveService();
    if (!drive) return null;

    try {
        const query = `'${parentFolderId}' in parents and name = '${subfolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
        });

        if (res.data.files && res.data.files.length > 0) {
            return res.data.files[0];
        }
        return null;
    } catch (err) {
        console.error("Error finding subfolder", err);
        return null;
    }
}
