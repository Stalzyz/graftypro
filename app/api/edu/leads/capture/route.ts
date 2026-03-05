import { NextResponse } from "next/server";
import { EduService } from "../../../../../lib/edu/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { workspaceId, ...leadData } = body;

        if (!workspaceId) {
            return NextResponse.json({ error: "Missing Workspace ID" }, { status: 400 });
        }

        const lead = await EduService.captureLead(workspaceId, leadData);

        return NextResponse.json({
            success: true,
            leadId: lead.id,
            message: "Inquiry captured. Automation triggered."
        });
    } catch (error: any) {
        console.error("Edu Capture Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
