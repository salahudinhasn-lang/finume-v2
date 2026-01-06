
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const { prompt, context, modelName = 'gemini-2.5-flash-lite' } = await req.json();

        const client = new GoogleGenAI({ apiKey });

        const systemInstruction = context
            ? `You are an intelligent financial assistant for the FINUME platform. Context: ${context}`
            : `You are a helpful assistant for the FINUME financial platform.`;

        const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
                systemInstruction,
                temperature: 0.7,
            }
        });

        return NextResponse.json({ text: response.text });
    } catch (error: any) {
        console.error("Gemini API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
