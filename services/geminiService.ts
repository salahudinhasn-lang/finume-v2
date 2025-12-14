
import { Service } from '../types';

export const generateAIResponse = async (
  prompt: string,
  context?: string,
  modelName: string = 'gemini-2.5-flash-lite'
): Promise<string> => {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, context, modelName }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};

export const matchServiceWithAI = async (userInput: string, services: Service[]): Promise<Service | null> => {
  try {
    const response = await fetch('/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput, services }),
    });

    if (!response.ok) {
      // Fallback logic could be handled here or throw
      throw new Error(`API Match Error: ${response.statusText}`);
    }

    const data = await response.json();
    const matchedId = data.matchedId;
    const service = services.find(s => s.id === matchedId);

    return service || services[0];
  } catch (error) {
    console.error("AI Match Error:", error);
    return services[0];
  }
};
