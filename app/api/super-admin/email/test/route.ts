import { NextResponse } from "next/server";
import { EmailService } from "../../../../../lib/email/service";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
    try {
        await requireSuperAdmin();
        const body = await request.json();
        const { to } = body;

        if (!to) {
            return NextResponse.json({ error: "Recipient email is required" }, { status: 400 });
        }

        console.log(`[SMTP Test] Initiating connection probe to: ${to}`);
        const result = await EmailService.testConnection(to);

        if (result.success) {
            return NextResponse.json({ success: true, message: "Test signal dispatched." });
        } else {
            console.error(`[SMTP Test] Probe failed: ${result.error}`);
            return NextResponse.json({ 
                success: false, 
                error: result.error || "Unknown SMTP failure" 
            }, { status: 500 });
        }
    } catch (error: any) {
        console.error("[SMTP Test API Error]:", error.message);
        return NextResponse.json({ error: error.message || "Unauthorized" }, { status: 401 });
    }
}
