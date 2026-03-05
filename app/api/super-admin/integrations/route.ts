import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const admin = await getAdminSession();
        if (!admin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const integrations = await prisma.whatsAppAccount.findMany({
            include: {
                workspace: {
                    select: {
                        name: true,
                        business_name: true
                    }
                },
                health_logs: {
                    take: 1,
                    orderBy: { checked_at: "desc" }
                }
            },
            orderBy: { created_at: "desc" }
        });

        // Calculate summary stats
        const summary = {
            total: integrations.length,
            healthy: integrations.filter(i => i.health_status === "HEALTHY").length,
            critical: integrations.filter(i => i.health_status === "CRITICAL").length,
            suspended: integrations.filter(i => i.integration_status === "SUSPENDED").length
        };

        return NextResponse.json({
            integrations,
            summary
        });
    } catch (error: any) {
        console.error("Super Admin Integrations API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
