import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Ensure upload dir exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filePath = path.join(uploadDir, filename);
        await fs.promises.writeFile(filePath, buffer);

        // Return URL
        const fileUrl = `/uploads/${filename}`;

        return NextResponse.json({
            url: fileUrl,
            name: file.name,
            size: file.size,
            type: file.type
        });

    } catch (error) {
        console.error('Upload Error', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
