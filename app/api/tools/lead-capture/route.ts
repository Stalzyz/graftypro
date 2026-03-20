import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const { phone, tool, metadata } = await req.json();

        if (!phone || phone.length < 10) {
            return NextResponse.json({ error: "Valid phone number required" }, { status: 400 });
        }

        // Avoid spam: Check if this phone has been recorded in the last 24 hours
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const existingLead = await prisma.publicToolLead.findFirst({
            where: {
                phone,
                tool_type: tool || 'LINK_GENERATOR',
                created_at: { gte: twentyFourHoursAgo }
            }
        });

        if (existingLead) {
            return NextResponse.json({ success: true, message: "Lead already captured" });
        }

        const lead = await prisma.publicToolLead.create({
            data: {
                phone,
                tool_type: tool || 'LINK_GENERATOR',
                metadata: metadata || {}
            }
        });

        return NextResponse.json({ success: true, leadId: lead.id });
    } catch (error: any) {
        console.error("[LeadCapture] API Error:", error.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
