import { GoogleGenerativeAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export async function analyzeDocument(fileBuffer: Buffer, mimeType: string): Promise<string | null> {
    if (!apiKey) {
        console.warn("GEMINI_API_KEY is missing");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Analyze this document and categorize it into EXACTLY one of the following categories:
            - Sales Invoice
            - Purchase Invoice
            - Contract
            - Expense
            - Petty Cash
            - Bank Statement
            - VAT Return
            - Other

            Return ONLY the category name. nothing else.
        `;

        const imagePart = {
            inlineData: {
                data: fileBuffer.toString("base64"),
                mimeType: mimeType
            }
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        return text ? text.trim() : null;

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
}
