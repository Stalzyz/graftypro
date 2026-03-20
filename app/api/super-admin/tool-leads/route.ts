import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const leads = await prisma.publicToolLead.findMany({
            orderBy: { created_at: 'desc' },
            take: 500
        });
        return NextResponse.json(leads);
    } catch (error: any) {
        console.error("[ToolLeads GET] Error:", error.message);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
