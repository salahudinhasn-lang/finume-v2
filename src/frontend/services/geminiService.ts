
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

// --- HYBRID MATCHING LOGIC ---
const predictServiceLocally = (userInput: string): string | null => {
  const normalize = (s: string) => s.toLowerCase().trim();
  const input = normalize(userInput);

  // 1. CFO / Strategy (Strongest Match)
  if (
    input.includes('cfo') ||
    input.includes('chief financial') ||
    input.includes('manager') ||
    input.includes('budget') ||
    input.includes('strategy') ||
    input.includes('مدير مالي') ||
    input.includes('تخطيط')
  ) {
    return 'S5'; // CFO Advisory
  }

  // 2. Audit (Very Specific)
  if (
    input.includes('audit') ||
    input.includes('financial statement') ||
    input.includes('review') ||
    input.includes('assurance') ||
    input.includes('tdaliq') ||
    input.includes('تدقيق') ||
    input.includes('مراجعة')
  ) {
    return 'S3'; // Financial Audit
  }

  // 3. Zakat (Religious Tax)
  if (
    input.includes('zakat') ||
    input.includes('zakah') ||
    input.includes('زكاة')
  ) {
    return 'S4'; // Zakat Advisory
  }

  // 4. VAT / Tax (Common)
  if (
    input.includes('vat') ||
    input.includes('tax') ||
    input.includes('filing') ||
    input.includes('return') ||
    input.includes('zatca') ||
    input.includes('ضريبة') ||
    input.includes('إقرار')
  ) {
    return 'S1'; // VAT Filing
  }

  // 5. Bookkeeping (Default for documents)
  if (
    input.includes('invoice') ||
    input.includes('receipt') ||
    input.includes('bill') ||
    input.includes('expense') ||
    input.includes('ledger') ||
    input.includes('bookkeeping') ||
    input.includes('فاتورة') ||
    input.includes('إيصال')
  ) {
    return 'S2'; // Monthly Bookkeeping
  }

  return null; // No strong local match, use AI
};

export const matchServiceWithAI = async (userInput: string, services: Service[]): Promise<Service | null> => {
  try {
    // 1. Try Local Prediction First (Instant & Reliable)
    const localMatchId = predictServiceLocally(userInput);
    if (localMatchId) {
      console.log(`🚀 Instant Local Match: ${userInput} -> ${localMatchId}`);
      const service = services.find(s => s.id === localMatchId);
      if (service) return service;
    }

    // 2. Fallback to Server AI
    console.log(`🤖 Consulting AI for: ${userInput}`);
    const response = await fetch('/api/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userInput, services }),
    });

    if (!response.ok) {
      console.warn(`API Error: ${response.statusText}, failing over to default.`);
      throw new Error(`API Match Error: ${response.statusText}`);
    }

    const data = await response.json();
    const matchedId = data.matchedId ? String(data.matchedId).trim() : null;

    if (!matchedId) return services[0];

    // Robust finding (case-insensitive, ignore dashes if needed)
    const service = services.find(s =>
      s.id === matchedId ||
      s.id.toLowerCase() === matchedId.toLowerCase() ||
      s.id.replace('-', '') === matchedId.replace('-', '')
    );

    return service || services[0];
  } catch (error) {
    console.error("AI Match Error:", error);
    // If local failed and AI failed, default to 'Monthly Bookkeeping' (S2) often safer than VAT
    return services.find(s => s.id === 'S2') || services[0];
  }
};
