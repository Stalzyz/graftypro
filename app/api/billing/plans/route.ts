
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { is_active: true, is_public: true },
            orderBy: { price: "asc" }
        });
        // Sort by sort_order first (new column, may not be in Prisma types yet)
        plans.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || (Number(a.price) || 0) - (Number(b.price) || 0));

        const response = plans.map((plan: any) => ({
            ...plan,
            price: Number(plan.monthly_price) || Number(plan.price) || 0,
            monthly_price: Number(plan.monthly_price) || Number(plan.price) || 0,
            yearly_price: Number(plan.yearly_price) || 0,
            original_monthly_price: Number(plan.original_monthly_price) || Number(plan.monthly_price) || Number(plan.price) || 0,
            original_yearly_price: Number(plan.original_yearly_price) || 0,
            credits: plan.credits || plan.max_messages || 0,
            features: Array.isArray(plan.features_list) ? plan.features_list : [],
            features_list: Array.isArray(plan.features_list) ? plan.features_list : [],
            cta_label: plan.cta_label || "Get Started",
            badge_text: plan.badge_text || "",  // only show if explicitly set by admin
            accent_color: plan.accent_color || "#27954D",
            sort_order: plan.sort_order || 0,
        }));

        return NextResponse.json({ data: response });
    } catch (error: any) {
        console.error("GET Billing Plans Error:", error);
        return NextResponse.json({ error: "Failed to fetch plans", details: error.message }, { status: 500 });
    }
}
