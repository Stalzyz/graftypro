import { NextResponse } from "next/server";
import { SystemConfigService } from "../../../../lib/services/system-config-service";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const config = await SystemConfigService.getPublicConfig();
        return NextResponse.json({ success: true, data: config });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}
