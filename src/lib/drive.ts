import { google } from 'googleapis';
import { Readable } from 'stream';

// These should be in your .env
// GOOGLE_CLIENT_ID=...
// GOOGLE_CLIENT_SECRET=...
// GOOGLE_REFRESH_TOKEN=...
// GOOGLE_DRIVE_MASTER_FOLDER_ID=...

const SCOPES = ['https://www.googleapis.com/auth/drive'];

export async function getDriveService() {
    // 1. Priority: Service Account (Permanent, no refresh needed)
    // Check for Service Account credentials in .env
    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    // Handle escaped newlines in private key which often happens in .env files
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
        try {
            const auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey,
                },
                scopes: SCOPES,
            });
            return google.drive({ version: 'v3', auth });
        } catch (saErr) {
            console.error("Service Account Auth failed:", saErr);
            // Fallthrough to try OAuth if this fails
        }
    }

    // 2. Fallback: OAuth 2.0 (User Credentials)
    // Requires refreshing and valid GOOGLE_REFRESH_TOKEN
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN?.trim();

    if (!clientId || !clientSecret || !refreshToken) {
        // Only log if NEITHER method is available
        if (!clientEmail) {
            console.error("Missing Google Drive Credentials. Need Service Account (EMAIL/KEY) OR OAuth (ID/SECRET/TOKEN).");
        }
        return null;
    }

    try {
        const auth = new google.auth.OAuth2(
            clientId,
            clientSecret,
            'https://developers.google.com/oauthplayground'
        );

        auth.setCredentials({
            refresh_token: refreshToken
        });
        return google.drive({ version: 'v3', auth });
    } catch (err) {
        console.error("OAuth Initialization Error:", err);
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
        return file.data;
    } catch (err) {
        console.error('Error creating folder:', err);
        throw err; // Re-throw to let caller handle/see the error
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

export async function getFileStream(fileId: string) {
    const drive = await getDriveService();
    if (!drive) return null;

    try {
        const response = await drive.files.get({
            fileId: fileId,
            alt: 'media',
        }, { responseType: 'stream' });

        return {
            stream: response.data,
            contentType: response.headers['content-type'],
            contentLength: response.headers['content-length']
        };
    } catch (err) {
        console.error("Error getting file stream", err);
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
