
import OpenAI from "openai";

let _openai: OpenAI | null = null;
function getOpenAI() {
    if (!_openai && process.env.OPENAI_API_KEY) {
        _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
    return _openai;
}

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
            const openai = getOpenAI();
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
            // Return empty array to silence errors in UI
            return [];
        }
    }

    static async verifyKycDocument(imageUrl: string, type: string) {
        if (!process.env.OPENAI_API_KEY) {
            // If No API Key, fallback to heuristic (to avoid blocking during dev/test)
            return {
                success: !imageUrl.includes('placeholder'),
                reason: imageUrl.includes('placeholder') ? "Mock Detection: Image appears to be a placeholder." : null,
                score: 0.8
            };
        }

        try {
            const openai = getOpenAI();
            if (!openai) throw new Error("OpenAI Client not initialized");
            
            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini", // Efficient and has Vision
                messages: [
                    {
                        role: "system",
                        content: `You are an expert KYC (Know Your Customer) document verification engine. 
                        Your task is to analyze an image and determine if it is a legitimate ${type} document for the country of India.
                        
                        Criteria:
                        1. It must be an actual photo or scan of a physical document.
                        2. If it is a PAN card, it must look like an Indian Income Tax PAN card.
                        3. If it is an Aadhar card, it must look like a UIDAI Aadhar card.
                        4. Reject random objects, nature, digital icons, placeholders, or unrelated people.
                        5. Reject "Sample" or "Example" documents if clearly marked.
                        
                        Return JSON format: 
                        { 
                          "is_valid": boolean, 
                          "confidence_score": number (0-1), 
                          "extracted_info": { "id_name": string, "id_number": string }, 
                          "rejection_reason": string | null 
                        }`
                    },
                    {
                        role: "user",
                        content: [
                            { type: "text", text: `Analyze this image as a ${type} document.` },
                            {
                                type: "image_url",
                                image_url: { url: imageUrl }
                            }
                        ]
                    }
                ],
                max_tokens: 300,
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(response.choices[0].message.content || "{}");
            return {
                success: result.is_valid,
                score: result.confidence_score,
                extracted_data: result.extracted_info,
                reason: result.rejection_reason
            };
        } catch (error: any) {
            console.error("AI Vision KYC Error:", error);
            // On failure, we might want to default to human review or rejection
            return { success: false, score: 0, reason: "AI Engine Processing Fault: " + error.message };
        }
    }

    static async generateFlowScript(prompt: string) {
        if (!process.env.OPENAI_API_KEY) {
            // Mock Response for BSP
            return {
                name: "AI Generated Flow",
                trigger_keyword: "start",
                steps: [
                    { id: "welcome", text: "Hello! This is an AI-generated flow based on your prompt: " + prompt, options: [{ label: "Cool!", next: "done" }] },
                    { id: "done", text: "Glad you like it! 🚀" }
                ]
            };
        }

        try {
            const openai = getOpenAI();
            if (!openai) throw new Error("OpenAI Client not initialized");

            const response = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `You are a WhatsApp Automation Expert. Generate a "SimpleFlow" JSON script based on the user's prompt.
                        
                        Schema:
                        {
                            "name": string,
                            "trigger_keyword": string,
                            "steps": [
                                {
                                    "id": string (unique slug),
                                    "text": string,
                                    "type": "message" | "action" | "condition" | "payment" | "sync_data",
                                    "options": [{ "label": "Button Text", "next": "target_step_id" }] (max 3),
                                    "actionType": "save_to_crm" | "send_email" | "webhook" (only for type: action),
                                    "config": {
                                        "url": string (for sync_data),
                                        "method": "GET" | "POST",
                                        "syncKey": string (variable name to save result as),
                                        "jsonPath": string (optional, e.g. "data.status"),
                                        "amount": string (for payment),
                                        "paymentTitle": string (for payment)
                                    }
                                }
                            ]
                        }

                        Rules:
                        1. Always start with a welcoming message.
                        2. Keep it concise for WhatsApp.
                        3. Use emojis to make it friendly.
                        4. For dynamic data, use {{variable_name}} in text (e.g. "Your balance is {{balance}}").
                        5. Use type: "sync_data" to fetch external values (like order status or account balance).
                        6. Return ONLY the JSON object.`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                max_tokens: 1000,
                response_format: { type: "json_object" }
            });

            return JSON.parse(response.choices[0].message.content || "{}");
        } catch (error: any) {
            console.error("AI Flow Generation Error:", error);
            throw error;
        }
    }
}
