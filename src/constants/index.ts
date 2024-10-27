export const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DEFAULT_QUOTE = "Aja rumangsa bisa, nanging bisaa rumangsa - Jangan merasa bisa, tetapi bisalah merasa";

// services/QuoteService.ts
import axios from 'axios';

export class QuoteService {
    private readonly apiKey: string;

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public async getMotivationalQuote(): Promise<string> {
        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.apiKey}`,
                {
                    contents: [{
                        parts: [{
                            text: "Berikan satu quote motivasi atau filosofi Jawa (dengan terjemahan Bahasa Indonesia) tentang semangat belajar, kesuksesan, atau kehidupan. Format: Quote Jawa - Terjemahan Indonesia"
                        }]
                    }]
                }
            );

            return response.data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error('Error getting quote:', error);
            return DEFAULT_QUOTE;
        }
    }
}
