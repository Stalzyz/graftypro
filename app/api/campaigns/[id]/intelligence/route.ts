import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const campaignId = params.id;

        // 1. Basic Counts (Optimized index usage)
        const [failedCount, readCount, unreadCount] = await Promise.all([
            prisma.message.count({
                where: { 
                    workspace_id: user.workspaceId,
                    campaign_id: campaignId, 
                    status: "FAILED" 
                }
            }),
            prisma.message.count({
                where: { 
                    workspace_id: user.workspaceId,
                    campaign_id: campaignId, 
                    status: "READ" 
                }
            }),
            prisma.message.count({
                where: { 
                    workspace_id: user.workspaceId,
                    campaign_id: campaignId, 
                    status: { in: ["SENT", "DELIVERED"] } 
                }
            })
        ]);

        // 2. Advanced: REPLIED (High Intent)
        // Find contacts who sent an INBOUND message after our campaign OUTBOUND
        const repliedContacts = await prisma.message.groupBy({
            by: ['contact_id'],
            where: {
                workspace_id: user.workspaceId,
                direction: "INBOUND",
                conversation: {
                    messages: {
                        some: {
                            campaign_id: campaignId,
                            direction: "OUTBOUND"
                        }
                    }
                }
            },
        });

        // 3. Metadata for UI Confidence
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            select: { name: true, created_at: true }
        });

        return NextResponse.json({
            success: true,
            data: {
                campaignName: campaign?.name || "Original Campaign",
                counts: {
                    FAILED: failedCount,
                    READ: readCount,
                    UNREAD: unreadCount,
                    REPLIED: repliedContacts.length
                },
                potentialImpact: failedCount + readCount + unreadCount + repliedContacts.length
            }
        });

    } catch (error: any) {
        console.error("[Intelligence API] Error:", error);
        return NextResponse.json({ error: "Failed to calculate intelligence" }, { status: 500 });
    }
}
