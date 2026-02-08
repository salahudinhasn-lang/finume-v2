import { NextResponse } from 'next/server';
import { getDriveService } from '@/lib/drive';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const drive = await getDriveService();
        if (!drive) {
            return NextResponse.json({
                status: 'Error',
                message: 'getDriveService returned null. Check env vars.'
            }, { status: 500 });
        }

        const masterId = process.env.GOOGLE_DRIVE_MASTER_FOLDER_ID;

        // Try to list files
        const response = await drive.files.list({
            q: masterId ? `'${masterId}' in parents` : undefined,
            pageSize: 5,
            fields: 'files(id, name)'
        });

        return NextResponse.json({
            status: 'Success',
            message: 'Drive connection working!',
            files: response.data.files,
            authMethod: process.env.GOOGLE_CLIENT_EMAIL ? 'Service Account' : 'OAuth',
            envCheck: {
                hasClientId: !!process.env.GOOGLE_CLIENT_ID,
                hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
                hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
                refreshTokenLength: process.env.GOOGLE_REFRESH_TOKEN?.length || 0
            }
        });

    } catch (error: any) {
        return NextResponse.json({
            status: 'Falied',
            error: error.message,
            fullError: error
        }, { status: 500 });
    }
}
