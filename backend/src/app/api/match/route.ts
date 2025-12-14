
import { GoogleGenAI } from "@google/genai";
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(req: Request) {
    try {
        if (!apiKey) {
            return NextResponse.json({ error: 'GEMINI_API_KEY is not configured' }, { status: 500 });
        }

        const { userInput, services } = await req.json();

        if (!services || !Array.isArray(services)) {
            return NextResponse.json({ error: 'Invalid services data' }, { status: 400 });
        }

        const serviceList = services.map((s: any) => `ID: ${s.id}, Name: ${s.nameEn}, Description: ${s.description}`).join('\n');

        const prompt = `
      You are a smart dispatch system for a financial services marketplace.
      
      User Input (Short Description or Tag): "${userInput}"
      
      Available Services:
      ${serviceList}
      
      Task: Analyze the user input and map it to the single most relevant Service ID from the list.
      - If "invoice", "vendor", "receipt" -> Likely Bookkeeping.
      - If "VAT", "Tax", "Filing" -> Likely VAT Filing.
      - If "Zakat" -> Likely Zakat Advisory.
      - If "Audit" -> Likely Financial Audit.
      
      Output: Return ONLY the Service ID string (e.g., S1). Do NOT return JSON or any other text.
    `;

        const client = new GoogleGenAI({ apiKey });

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                temperature: 0.1,
            }
        });

        const matchedId = response.text?.trim().replace(/[^a-zA-Z0-9-]/g, '');

        return NextResponse.json({ matchedId });
    } catch (error: any) {
        console.error("Gemini Match API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
