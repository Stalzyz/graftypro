
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { AIService } from "../../../../../lib/ai/openai";

export const dynamic = 'force-dynamic';

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const conversationId = params.id;

        // Fetch last 10 messages for context
        const messages = await prisma.message.findMany({
            where: {
                conversation_id: conversationId,
                workspace_id: user.workspaceId
            },
            orderBy: { created_at: "desc" },
            take: 10
        });

        if (messages.length === 0) {
            return NextResponse.json({ suggestions: ["Hello! How can I help you today?"] });
        }

        const context = messages.reverse().map(m => ({
            role: m.direction === "INBOUND" ? 'user' : 'assistant',
            content: (m.content as any).body || (m.content as any).caption || "[Media Message]"
        }));

        const suggestions = await AIService.suggestReply(context as any);

        return NextResponse.json({ suggestions });
    } catch (error: any) {
        console.error("AI Suggestion Error:", error);
        return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
    }
}
