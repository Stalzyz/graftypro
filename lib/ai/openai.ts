
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

    /**
     * 🔍 SEMANTIC SEARCH: Find relevant knowledge chunks with Source Attribution
     */
    static async findRelevantKnowledge(workspaceId: string, query: string, limit = 5): Promise<{ content: string, source: string }[]> {
        if (!workspaceId) {
            console.warn("[AIService] findRelevantKnowledge called without workspaceId");
            return [];
        }

        try {
            const embedding = await this.getEmbedding(query);
            const embeddingSql = `[${embedding.join(",")}]`;

            // PostgreSQL Vector Similarity Search with JOIN to get source names
            const chunks: any[] = await prisma.$queryRawUnsafe(
                `SELECT c.content, s.name as source_name
                 FROM "knowledge_chunks" c
                 JOIN "knowledge_sources" s ON c.source_id = s.id
                 WHERE c.workspace_id = $1 
                 ORDER BY c.embedding <=> $2::vector 
                 LIMIT $3`,
                workspaceId,
                embeddingSql,
                limit
            );

            return chunks.map(c => ({
                content: c.content,
                source: c.source_name
            }));
        } catch (error: any) {
            console.error(`[AIService] Knowledge Retrieval Error for workspace ${workspaceId}:`, error.message);
            // Graceful degradation: return empty context so assistant can fallback to general knowledge
            return [];
        }
    }

    /**
     * 🤖 GROUNDED ANSWER: RAG Generation (v1.3 Additive Intelligence)
     */
    static async getGroundedAnswer(workspaceId: string, query: string, history: { role: 'user' | 'assistant', content: string }[] = []) {
        try {
            // 1. Fetch relevant context with attribution
            const contextData = await this.findRelevantKnowledge(workspaceId, query);
            
            if (!contextData.length) {
                return null; // Fallback to general AI if no knowledge found
            }

            // Group context by source for better readability in the prompt
            const context = contextData.map(c => `[SOURCE: ${c.source}]\n${c.content}`).join("\n\n---\n\n");

            const openai = getOpenAI();
            if (!openai) throw new Error("OpenAI Client not initialized");

            // 2. Build Nuclear RAG Prompt with Smart Handoff & Citations
            const systemPrompt = `You are a highly advanced AI Sales & Support Autopilot for "Grafty BSP".
            Your task is to answer accurately using the Knowledge Base AND qualify the user as a lead.

            LEAD QUALIFICATION (PROACTIVE):
            - If the user shows interest, try to steer them toward booking a demo.
            - Detect if they provide contact info or specific business requirements.
            
            TONE & LANGUAGE:
            - Professional yet conversational.
            - Use format: simple paragraphs, bullet points, emojis.
            
            CITATIONS:
            - Always cite your source: "[Source: Name]".

            CONSTRAINTS:
            - ONLY use the provided context. If absent, offer "TALK_TO_HUMAN".
            
            RETURN FORMAT (STRICT JSON):
            {
              "answer": "Grounded response with citations",
              "recommended_buttons": ["TALK_TO_HUMAN", "REQUEST_DEMO", "VIEW_PRICING"],
              "intent": "QUALIFIED_LEAD | GENERAL_QUERY | SUPPORT",
              "lead_capture": {
                 "name": "Extracted name or null",
                 "interest": "Summary of what they want or null"
              }
            }

            CONTEXT FROM KNOWLEDGE BASE:
            ${context}`;

            const response = await openai.chat.completions.create({
                model: "gpt-4o", // Upgraded to Full GPT-4
                messages: [
                    { role: "system", content: systemPrompt },
                    ...history.slice(-5).map(m => ({ role: m.role as any, content: m.content })),
                    { role: "user", content: query }
                ],
                max_tokens: 800,
                temperature: 0.5,
                response_format: { type: "json_object" }
            });

            const raw = response.choices[0].message.content || "{}";
            return JSON.parse(raw);
        } catch (error: any) {
            console.error("Grounded Answer Error:", error);
            return null;
        }
    }

    static async getEmbedding(text: string): Promise<number[]> {
        try {
            const openai = getOpenAI();
            if (!openai) throw new Error("OpenAI Client not initialized");

            const response = await openai.embeddings.create({
                model: "text-embedding-3-small",
                input: text.replace(/\0/g, "").replace(/\s+/g, " ").trim(),
            });

            return response.data[0].embedding;
        } catch (error: any) {
            console.error("OpenAI Embedding Error:", error);
            throw error;
        }
    }
}
