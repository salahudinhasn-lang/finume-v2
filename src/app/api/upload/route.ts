import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure upload directory exists
        const relativeUploadDir = `/uploads/${new Date().toISOString().split('T')[0]}`;
        const uploadDir = join(process.cwd(), 'public', relativeUploadDir);

        try {
            await mkdir(uploadDir, { recursive: true });
        } catch (e) {
            // Ignore if exists
        }

        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const filename = `${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`; // Sanitize
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        const fileUrl = `${relativeUploadDir}/${filename}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
            name: file.name,
            size: file.size,
            type: file.type
        });

    } catch (e) {
        console.error("Upload error:", e);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}
