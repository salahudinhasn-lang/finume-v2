import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocument } from '@/lib/gemini';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const category = await analyzeDocument(buffer, file.type);

        return NextResponse.json({
            success: true,
            category: category || 'Other'
        });

    } catch (error: any) {
        console.error('Analysis API Error', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
