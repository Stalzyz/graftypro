import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

import { SystemConfigService } from "../../../../lib/services/system-config-service";

export async function GET() {
    try {
        await requireSuperAdmin();
        const config = await SystemConfigService.getConfig();
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}

export async function POST(request: Request) {
    try {
        await requireSuperAdmin();
        const body = await request.json();
        const config = await SystemConfigService.updateConfig(body);
        return NextResponse.json(config);
    } catch (error: any) {
        console.error("Config Update Error:", error);

        // Check for specific Prisma errors
        if (error.code === 'P2022') {
            return NextResponse.json({
                error: `Database Schema Out of Sync: The column '${error.meta?.column}' is missing. Please run database migrations.`
            }, { status: 500 });
        }

        if (error.code === 'P2002') {
            return NextResponse.json({
                error: "Unique constraint violation: Some of these values are already in use."
            }, { status: 400 });
        }

        return NextResponse.json({
            error: error.message || "Failed to update config. Please check server logs for details."
        }, { status: 500 });
    }
}
