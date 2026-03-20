import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            include: {
                referrals: true,
                _count: {
                    select: { referrals: true }
                }
            }
        });

        if (!workspace) {
            return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
        }

        const wallet = await prisma.vendorWallet.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        // Calculate stats
        const confirmedReferrals = await prisma.workspace.count({
            where: {
                referred_by_id: user.workspaceId,
                referral_bonus_awarded: true
            }
        });

        return NextResponse.json({
            code: workspace.referral_code,
            stats: {
                total_referrals: workspace._count.referrals,
                confirmed_referrals: confirmedReferrals,
                bonus_balance: Number((wallet as any)?.service_bonus_balance || 0)
            }
        });

    } catch (error) {
        console.error("Referral Data Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
