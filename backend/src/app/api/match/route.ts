
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

        const serviceList = services.map((s: any) => `${s.id}: ${s.nameEn} (${s.nameAr}) - ${s.description}`).join('\n');

        const prompt = `You are an intelligent service matching system for a Saudi Arabian financial services marketplace.

Your task: Analyze the user's description and match it to the MOST RELEVANT service using semantic understanding.

User's Description: "${userInput}"

Available Services:
${serviceList}

ANALYSIS INSTRUCTIONS:
1. Read the user's input and understand what financial service they need
2. Consider the business context in Saudi Arabia
3. Match based on MEANING, not just keywords
4. Think about what service would actually help with this need

EXAMPLES:
- "CFO" or "Chief Financial Officer" → S5 (CFO Advisory) - they need strategic financial leadership
- "VAT Return for Q1" → S1 (VAT Filing) - they need tax compliance
- "Monthly invoices and expenses" → S2 (Bookkeeping) - they need accounting records
- "Audit report for investors" → S3 (Financial Audit) - they need formal auditing
- "Zakat calculation" → S4 (Zakat Advisory) - they need religious tax advice

UNDERSTAND THE DIFFERENCE:
- CFO/Strategy/Planning = Executive level financial management (S5)
- VAT/Tax/ZATCA = Tax compliance and filing (S1)
- Bookkeeping/Invoices = Day-to-day accounting (S2)

Return ONLY valid JSON:
{
  "matchedId": "S1"
}

The matchedId MUST be one of: S1, S2, S3, S4, or S5`;

        const client = new GoogleGenAI({ apiKey });

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash-lite',
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: 'application/json'
            }
        });

        const text = response.text || '{}';
        const jsonResponse = JSON.parse(text);

        return NextResponse.json({ matchedId: jsonResponse.matchedId });
    } catch (error: any) {
        console.error("Gemini Match API Error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
