import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getResellerSession } from "../../../../lib/reseller/auth-helper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resellerId = session.userId;

        const vendors = await prisma.workspace.findMany({
            where: { reseller_id: resellerId } as any,
            orderBy: { created_at: 'desc' },
            select: {
                id: true,
                name: true,
                business_name: true,
                status: true,
                created_at: true,
                plan_id: true,
                wallet: {
                    select: { current_balance: true }
                },
                _count: {
                    select: {
                        messages: true,
                        campaigns: true
                    }
                }
            }
        });

        const formattedVendors = vendors.map(v => ({
            id: v.id,
            workspace_id: v.id,
            mapped_at: v.created_at,
            name: v.name,
            business_name: v.business_name,
            status: v.status,
            balance: Number(v.wallet?.current_balance || 0),
            stats: {
                total_messages: v._count.messages,
                total_campaigns: v._count.campaigns
            }
        }));

        return NextResponse.json({ success: true, data: formattedVendors });
    } catch (error: any) {
        console.error("Reseller Vendors GET Error:", error);
        return NextResponse.json({ error: "Failed to load vendors" }, { status: 500 });
    }
}
