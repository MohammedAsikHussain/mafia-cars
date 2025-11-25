import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

// Initialize the Gemini AI client
// NOTE: In a real app, API Key should be secured on backend or proxied.
// The instructions allow process.env.API_KEY usage for this scope.
const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Generate a product description based on name and keywords.
 * Intended for Admin use.
 */
export const generateProductDescription = async (productName: string, keywords: string): Promise<string> => {
  try {
    const prompt = `Write a compelling, SEO-friendly, and concise product description (max 100 words) for a product named "${productName}". Key features/keywords to include: ${keywords}. Format as plain text.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Could not generate description.";
  } catch (error) {
    console.error("Error generating description:", error);
    return "Error calling AI service.";
  }
};

/**
 * Chatbot interaction.
 */
export const chatWithAI = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
  try {
    // We construct a chat session. In a real app, we might persist this object differently.
    // For this stateless service function, we'll just use generateContent with history as context 
    // or use the chat API if we were maintaining the object.
    // To keep it simple and robust for this demo structure, we will use a fresh chat 
    // but pass previous context effectively if needed, or just single turn for now if history is complex.
    
    // Better approach: Use the Chat API properly.
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "You are Mafia Assistant, a helpful, friendly, and knowledgeable AI shopping assistant for Mafia cars. You help users find products, answer questions about shipping (Free Shipping), returns (30 days), and provide style advice. Keep answers concise.",
      },
      history: history.map(h => ({
        role: h.role,
        parts: h.parts
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "I'm having trouble thinking right now.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I am offline momentarily.";
  }
};

/**
 * Visual Search: Analyze an image and return search keywords.
 */
export const analyzeImageForSearch = async (base64Image: string, mimeType: string): Promise<string[]> => {
  try {
    const prompt = "Analyze this image and provide a list of 3-5 keywords that describe the product shown, suitable for searching in an e-commerce store. Return ONLY a JSON array of strings, e.g., [\"sneakers\", \"red\", \"running\"].";
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Image
                }
            },
            {
                text: prompt
            }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Visual search error:", error);
    return [];
  }
};