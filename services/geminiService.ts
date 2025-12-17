import { GoogleGenAI } from "@google/genai";

class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    const apiKey = process.env.API_KEY;
    if (apiKey) {
      this.ai = new GoogleGenAI({ apiKey });
    } else {
      console.warn("Gemini API Key not found in environment variables.");
    }
  }

  async generateMnemonic(word: string, definition: string): Promise<string> {
    if (!this.ai) return "AI service unavailable. Please check API Key configuration.";

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        Create a short, memorable mnemonic or memory aid for the word "${word}". 
        The definition is: "${definition}".
        Keep it concise (under 30 words), witty, and helpful for a learner. 
        Do not use markdown formatting like bolding.
      `;

      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text || "Could not generate mnemonic.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Error connecting to AI service.";
    }
  }

  async generateContextStory(word: string): Promise<string> {
    if (!this.ai) return "AI service unavailable.";

    try {
      const model = 'gemini-2.5-flash';
      const prompt = `
        Write a very short, 2-sentence story that clearly demonstrates the meaning of the word "${word}".
        Highlight the usage.
      `;

      const response = await this.ai.models.generateContent({
        model,
        contents: prompt,
      });

      return response.text || "Could not generate story.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Error connecting to AI service.";
    }
  }
}

export const geminiService = new GeminiService();
