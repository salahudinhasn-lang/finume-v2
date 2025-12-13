import { GoogleGenAI } from "@google/genai";
import { Service } from '../types';

// Helper to safely get the AI client only when needed
const getAIClient = () => {
  // Check if process.env exists safely to avoid ReferenceError in strict browser environments
  const apiKey = (typeof process !== 'undefined' && process && process.env) ? process.env.API_KEY : '';
  
  if (!apiKey) {
    console.warn("Gemini API Key is missing. AI features will respond with mock data.");
  }
  
  // Return client with key (or dummy key to prevent immediate constructor error)
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });
};

export const generateAIResponse = async (
  prompt: string, 
  context?: string,
  modelName: string = 'gemini-2.5-flash'
): Promise<string> => {
  try {
    const ai = getAIClient();
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
    return "I'm having trouble connecting to my brain right now. Please try again later.";
  }
};

export const matchServiceWithAI = async (userInput: string, services: Service[]): Promise<Service | null> => {
  try {
    const ai = getAIClient();
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
    // Graceful fallback for demo purposes if API key is invalid
    if (userInput.toLowerCase().includes('vat')) return services.find(s => s.nameEn.includes('VAT')) || services[0];
    if (userInput.toLowerCase().includes('book')) return services.find(s => s.nameEn.includes('Bookkeeping')) || services[0];
    return services[0]; 
  }
};