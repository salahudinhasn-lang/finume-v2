import { GoogleGenAI } from "@google/genai";
import { Service } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAIResponse = async (
  prompt: string, 
  context?: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<string> => {
  try {
    const systemInstruction = context 
      ? `You are an intelligent financial assistant for the FINUME platform. Context: ${context}`
      : `You are a helpful assistant for the FINUME financial platform.`;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

export const matchServiceWithAI = async (userInput: string, services: Service[]): Promise<Service | null> => {
  try {
    const serviceList = services.map(s => `ID: ${s.id}, Name: ${s.nameEn}, Description: ${s.description}`).join('\n');
    
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1, // Low temperature for deterministic matching
      }
    });

    const matchedId = response.text?.trim().replace(/[^a-zA-Z0-9-]/g, '');
    const service = services.find(s => s.id === matchedId);
    
    return service || services[0]; // Fallback to first service if no match
  } catch (error) {
    console.error("AI Match Error:", error);
    return services[0]; // Fallback
  }
};