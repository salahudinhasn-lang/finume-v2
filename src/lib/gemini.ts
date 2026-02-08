import { GoogleGenerativeAI } from "@google/generative-ai";

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
            Analyze this document image/file and identify its type.
            Categorize it into EXACTLY one of the following categories:

            - Sales Invoice (Bill sent to customers)
            - Purchase Invoice (Bill received from vendors/suppliers)
            - Contract (Legal agreement)
            - Expense (Receipt for small business expenses)
            - Petty Cash (Small cash transaction record)
            - Bank Statement (Official bank record)
            - VAT Return (Tax document)
            - Other (If it doesn't clearly fit any above)

            **Rules:**
            - Look for keywords like "Invoice", "Bill To", "Tax Invoice" -> likely Invoice.
            - If it looks like a formal document with "Agreement" -> Contract.
            - If unsure, choose the closest match.
            - Return ONLY the category name string. Do not return "Category: ...".
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
