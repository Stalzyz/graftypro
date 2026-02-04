import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspaceId = user.workspaceId;

        const [
            contactsCount,
            messagesSent,
            activeFlows,
            recentCampaigns
        ] = await Promise.all([
            prisma.contact.count({
                where: { workspace_id: workspaceId }
            }),
            prisma.message.count({
                where: {
                    workspace_id: workspaceId,
                    direction: "OUTBOUND"
                }
            }),
            prisma.flow.count({
                where: {
                    workspace_id: workspaceId,
                    status: "PUBLISHED"
                }
            }),
            prisma.campaign.findMany({
                where: { workspace_id: workspaceId },
                orderBy: { created_at: "desc" },
                take: 5,
                select: {
                    id: true,
                    name: true,
                    status: true,
                    created_at: true,
                    // If we had stats relation integrated, fetch them. 
                    // For now, assume pending or mock stats if missing
                }
            })
        ]);

        return NextResponse.json({
            contactsCount,
            messagesSent,
            activeFlows,
            recentCampaigns: recentCampaigns.map(c => ({
                ...c,
                sent_count: 0 // Placeholder until CampaignStats linked
            }))
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
