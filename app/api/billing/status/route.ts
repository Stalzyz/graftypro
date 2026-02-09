
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const workspace = await (prisma.workspace as any).findUnique({
            where: { id: user.workspaceId },
            include: { plan_details: true }
        });

        // Legacy/Default limits if no plan_details linked
        // @ts-ignore
        const details = workspace?.plan_details || {
            name: workspace?.plan || "FREE",
            max_contacts: workspace?.plan === "PRO" ? 10000 : 100,
            max_flows: workspace?.plan === "PRO" ? 100 : 3,
            max_campaigns: workspace?.plan === "PRO" ? 999 : 1,
            max_messages: workspace?.plan === "PRO" ? 100000 : 500,
            crm_access: true,
            api_access: workspace?.plan === "PRO",
            flow_builder_access: true,
            drip_campaign_access: workspace?.plan === "PRO",
        };

        return NextResponse.json({
            plan: workspace?.plan || "FREE",
            status: workspace?.subscription_status,
            details
        });

    } catch (error) {
        return NextResponse.json({ error: "Error fetching status" }, { status: 500 });
    }
}
