
import { NextResponse } from "next/server";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { CRMService } from "../../../../../lib/services/crm-service";

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { leadId, action, description, details } = body;

        if (!leadId || !action) {
            return NextResponse.json({ error: "Lead ID and Action are required" }, { status: 400 });
        }

        const activity = await CRMService.addActivity(leadId, {
            action,
            description,
            adminId: session.id,
            details
        });

        return NextResponse.json(activity);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
