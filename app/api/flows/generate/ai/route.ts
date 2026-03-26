import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { AIService } from "@/lib/ai/openai";

export const dynamic = 'force-dynamic';

/**
 * 🤖 AI FLOW GENERATOR API
 * Converts natural language prompt to SimpleFlow script.
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { prompt } = await req.json();

        if (!prompt || prompt.length < 5) {
            return NextResponse.json({ error: "Prompt is too short" }, { status: 400 });
        }

        const script = await AIService.generateFlowScript(prompt);

        return NextResponse.json({ 
            success: true, 
            script 
        });

    } catch (error: any) {
        console.error("AI Generation API Error:", error);
        return NextResponse.json(
            { error: "AI Engine Busy", details: error.message },
            { status: 500 }
        );
    }
}
