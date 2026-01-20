import { google } from 'googleapis';
import { Readable } from 'stream';

// These should be in your .env
// GOOGLE_CLIENT_ID=...
// GOOGLE_CLIENT_SECRET=...
// GOOGLE_REFRESH_TOKEN=...
// GOOGLE_DRIVE_MASTER_FOLDER_ID=...

const SCOPES = ['https://www.googleapis.com/auth/drive'];

export async function getDriveService() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
        console.error("Missing Google Drive OAuth Credentials (ID, Secret, or Refresh Token)");
        return null;
    }

    try {
        const auth = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'https://developers.google.com/oauthplayground' // Redirect URI used to get token
        );

        auth.setCredentials({
            refresh_token: refreshToken
        });

        // No need to manually refresh; googleapis handles it if refresh_token is present
        return google.drive({ version: 'v3', auth });
    } catch (err) {
        console.error("Google Auth initialization error", err);
        return null;
    }
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
            supportsAllDrives: true,
        });

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
            body: Readable.from(fileBuffer),
        };

        const file = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink',
            supportsAllDrives: true,
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
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
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
