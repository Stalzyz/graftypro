
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const { SystemConfigService } = await import("../../../../lib/services/system-config-service");
        const publicConfig = await SystemConfigService.getPublicConfig();

        return NextResponse.json({
            success: true,
            ...publicConfig
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}
