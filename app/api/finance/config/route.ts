import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { SystemConfigService } from "../../../../lib/services/system-config-service";

export async function GET(req: NextRequest) {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        // Fetch System Config
        const config = await SystemConfigService.getConfig();
        return NextResponse.json(config.invoice_config || {});
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const user = await getCurrentUser(req);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Only allow ADMIN/OWNER/FINANCE to update config (assuming they are updating their own or system if super admin)
    // For this implementation, we target System Config (Global).
    // In a real multi-tenant reseller setup, we would check if user is a reseller.

    if (!["SUPER_ADMIN", "ADMIN", "OWNER"].includes(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();

        // Update System Config (Global)
        // We assume "global" ID based on schema default
        await prisma.systemConfig.upsert({
            where: { id: "global" },
            update: { invoice_config: body },
            create: { id: "global", invoice_config: body }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Config Update Failed:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
