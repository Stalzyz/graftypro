
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { is_active: true, is_public: true },
            orderBy: { price: "asc" }
        });

        const response = plans.map((plan: any) => ({
            ...plan,
            price: Number(plan.monthly_price) || Number(plan.price) || 0,
            monthly_price: Number(plan.monthly_price) || 0,
            yearly_price: Number(plan.yearly_price) || 0,
            credits: plan.credits || plan.max_messages || 0,
            features: Array.isArray(plan.features_list) ? plan.features_list : []
        }));

        return NextResponse.json({ data: response });
    } catch (error: any) {
        console.error("GET Billing Plans Error:", error);
        return NextResponse.json({ error: "Failed to fetch plans", details: error.message }, { status: 500 });
    }
}
