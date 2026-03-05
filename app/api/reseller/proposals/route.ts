
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const resellerId = req.headers.get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const proposals = await prisma.resellerProposal.findMany({
            where: { reseller_id: resellerId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ success: true, data: proposals });
    } catch (error: any) {
        console.error("Reseller Proposals GET Error:", error);
        return NextResponse.json({ error: "Failed to load proposals" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const resellerId = req.headers.get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, leadId, items, totalAmount } = await req.json();

        if (!title || !items || !totalAmount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Fraud protection: Validate items pricing logic
        // We verify each item's price against the platform's minimum reseller price (Margin Protection)
        let calculatedTotal = 0;
        for (const item of items) {
            const plan = await prisma.subscriptionPlan.findFirst({
                where: { name: item.planName }
            });

            if (plan) {
                const floorPrice = Number(plan.min_reseller_price);
                if (Number(item.price) < floorPrice) {
                    return NextResponse.json({
                        error: `Price for ${item.planName} is below the allowed floor of ₹${floorPrice}`
                    }, { status: 400 });
                }
            }
            calculatedTotal += Number(item.price);
        }

        // 2. Validate totalAmount matches items (Prevent request tampering)
        if (Math.abs(calculatedTotal - Number(totalAmount)) > 1) {
            return NextResponse.json({ error: "Proposal amount mismatch detected." }, { status: 400 });
        }

        const proposal = await prisma.resellerProposal.create({
            data: {
                reseller_id: resellerId,
                lead_id: leadId,
                title,
                items,
                total_amount: totalAmount,
                status: "DRAFT"
            }
        });

        return NextResponse.json({ success: true, data: proposal });
    } catch (error: any) {
        console.error("Reseller Proposals POST Error:", error);
        return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
    }
}
