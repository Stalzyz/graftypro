
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

// Prevent build-time crash if key is missing
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export class AIService {
    static async suggestReply(messages: { role: 'user' | 'assistant', content: string }[]) {
        if (!process.env.OPENAI_API_KEY) {
            // Mock response if no API key is provided for demonstration
            return [
                "Hello! How can I help you today?",
                "Sure, I can help with that. Could you provide more details?",
                "Thank you for contacting us. We will get back to you shortly."
            ];
        }

        try {
            if (!openai) return ["AI not configured"];
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a professional customer support assistant for a business using WhatsApp. Based on the conversation history, suggest 3 short, helpful, and concise replies. Return only the replies separated by a newline."
                    },
                    ...messages.map(m => ({
                        role: m.role as any,
                        content: m.content
                    }))
                ],
                max_tokens: 150,
                temperature: 0.7,
            });

            const text = response.choices[0].message.content || "";
            return text.split('\n').filter(line => line.trim().length > 0).slice(0, 3);
        } catch (error) {
            console.error("OpenAI Error:", error);
            return ["Error generating suggestions. Please try again."];
        }
    }
}
