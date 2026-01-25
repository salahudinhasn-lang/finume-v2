import { google } from 'googleapis';
import { Readable } from 'stream';

// These should be in your .env
// GOOGLE_CLIENT_ID=...
// GOOGLE_CLIENT_SECRET=...
// GOOGLE_REFRESH_TOKEN=...
// GOOGLE_DRIVE_MASTER_FOLDER_ID=...

const SCOPES = ['https://www.googleapis.com/auth/drive'];

export async function getDriveService() {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

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

// Simple in-memory cache to handle Drive API eventual consistency
// Key: `${parentFolderId}__${subfolderName}` -> Value: folderId
const folderCache = new Map<string, string>();

export async function createFolder(folderName: string, parentId?: string) {
    const drive = await getDriveService();
    if (!drive) return null;

    // Check cache first (optimistic)
    const effectiveParentId = parentId || process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID;
    const cacheKey = `${effectiveParentId}__${folderName}`;

    // Note: We don't return from cache on create, we want to create if logic asked. 
    // But actually, createFolder is usually called after findSubfolder failed.

    try {
        const fileMetadata: any = {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
        };

        if (parentId) {
            fileMetadata.parents = [parentId];
        } else if (process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID) {
            fileMetadata.parents = [process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID];
        }

        const file = await drive.files.create({
            requestBody: fileMetadata,
            fields: 'id, name, webViewLink',
            supportsAllDrives: true,
        });

        if (file.data.id) {
            // Cache the new folder
            folderCache.set(cacheKey, file.data.id);
            console.log(`[Drive] Created and Cached folder: ${folderName} (${file.data.id})`);
        }

        return file.data;
    } catch (err) {
        console.error('Error creating folder:', err);
        return null;
    }
}

export async function uploadFileToDrive(fileBuffer: Buffer, fileName: string, folderId: string, mimeType: string, shareWithEmail?: string) {
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

        if (!file.data.id) return file.data;

        // Try to make Public (primary goal)
        try {
            await drive.permissions.create({
                fileId: file.data.id,
                requestBody: {
                    role: 'reader',
                    type: 'anyone',
                },
            });
        } catch (pubErr) {
            console.warn(`[Drive] Public sharing failed for ${fileName}, trying specific user sharing...`);

            // Fallback: Share with uploader explicitly
            if (shareWithEmail) {
                try {
                    await drive.permissions.create({
                        fileId: file.data.id,
                        requestBody: {
                            role: 'reader',
                            type: 'user',
                            emailAddress: shareWithEmail
                        },
                        fields: 'id',
                    });
                    console.log(`[Drive] Shared ${fileName} with ${shareWithEmail}`);
                } catch (userErr) {
                    console.warn(`[Drive] User sharing also failed for ${shareWithEmail}`, userErr);
                }
            }
        }

        return file.data;
    } catch (err) {
        console.error("Upload to Drive failed", err);
        throw err;
    }
}

export async function findSubfolder(parentFolderId: string, subfolderName: string) {
    // Check Cache
    const cacheKey = `${parentFolderId}__${subfolderName}`;
    if (folderCache.has(cacheKey)) {
        console.log(`[Drive] Cache Hit for folder: ${subfolderName}`);
        return { id: folderCache.get(cacheKey), name: subfolderName };
    }

    const drive = await getDriveService();
    if (!drive) return null;

    try {
        console.log(`[Drive] Querying for folder: '${subfolderName}' in '${parentFolderId}'`);
        const query = `'${parentFolderId}' in parents and name = '${subfolderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
        const res = await drive.files.list({
            q: query,
            fields: 'files(id, name)',
            spaces: 'drive',
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
        });

        if (res.data.files && res.data.files.length > 0) {
            const folder = res.data.files[0];
            if (folder.id) {
                folderCache.set(cacheKey, folder.id);
                console.log(`[Drive] Found and Cached folder: ${subfolderName} (${folder.id})`);
            }
            return folder;
        }
        console.log(`[Drive] Folder not found: ${subfolderName}`);
        return null;
    } catch (err) {
        console.error("Error finding subfolder", err);
        return null;
    }
}

export async function renameFileOrFolder(fileId: string, newName: string) {
    const drive = await getDriveService();
    if (!drive) return null;

    try {
        const file = await drive.files.update({
            fileId: fileId,
            requestBody: {
                name: newName
            },
            fields: 'id, name',
            supportsAllDrives: true,
        });
        return file.data;
    } catch (err) {
        console.error("Error renaming file/folder", err);
        return null;
    }
}
