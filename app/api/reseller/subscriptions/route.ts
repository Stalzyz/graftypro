import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reseller = await prisma.reseller.findUnique({
            where: { id: session.userId },
            // @ts-ignore
            select: { role: true }
        });

        if ((reseller as any)?.role !== "PLATFORM") {
            return NextResponse.json({ error: "Access Denied: Platform Partners only" }, { status: 403 });
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where: {
                // @ts-ignore
                reseller_id: session.userId
            },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ data: plans });

    } catch (error) {
        console.error("Fetch Plans Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reseller = await prisma.reseller.findUnique({
            where: { id: session.userId },
            // @ts-ignore
            select: { id: true, role: true }
        });

        if ((reseller as any)?.role !== "PLATFORM") {
            return NextResponse.json({ error: "Access Denied: Platform Partners only" }, { status: 403 });
        }

        const body = await req.json();
        const { name, description, monthly_price, yearly_price, base_plan_id } = body;

        if (!name || monthly_price === undefined || !base_plan_id) {
            return NextResponse.json({ error: "Name, monthly price, and a base plan are required" }, { status: 400 });
        }

        // Fetch the base plan crafted by the Super Admin
        const basePlan = await prisma.subscriptionPlan.findFirst({
            where: { id: base_plan_id, reseller_id: null, is_active: true }
        });

        if (!basePlan) {
            return NextResponse.json({ error: "Invalid base matrix selected." }, { status: 400 });
        }

        const FLOOR_PRICE = Number(basePlan.min_reseller_price) || 0;
        if (parseFloat(monthly_price) < FLOOR_PRICE) {
            return NextResponse.json({ error: `Retail price must be at least ₹${FLOOR_PRICE} to cover wholesale cost.` }, { status: 400 });
        }

        const newPlan = await prisma.subscriptionPlan.create({
            data: {
                name: `${session.userId.slice(0, 5)}_${name}`,
                description,
                monthly_price: parseFloat(monthly_price),
                yearly_price: parseFloat(yearly_price || 0),

                // --- CLONE ALL STRUCTURAL LIMITS FROM BASE ---
                max_users: basePlan.max_users,
                max_contacts: basePlan.max_contacts,
                max_flows: basePlan.max_flows,
                max_campaigns: basePlan.max_campaigns,
                max_messages: basePlan.max_messages,
                max_teams: basePlan.max_teams,

                // --- CLONE ALL FEATURE GATES FROM BASE ---
                api_access: basePlan.api_access,
                crm_access: basePlan.crm_access,
                flow_builder_access: basePlan.flow_builder_access,
                drip_campaign_access: basePlan.drip_campaign_access,
                commerce_access: basePlan.commerce_access,
                edu_engine_access: basePlan.edu_engine_access,

                // --- METADATA ---
                // @ts-ignore
                reseller_id: session.userId,
                is_public: false,
                min_reseller_price: basePlan.min_reseller_price, // Cache the base cost
            }
        });

        return NextResponse.json({ data: newPlan });

    } catch (error) {
        console.error("Create Plan Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const planId = searchParams.get("id");
        if (!planId) return NextResponse.json({ error: "Plan ID required" }, { status: 400 });

        // Ensure plan belongs to this reseller
        const plan = await prisma.subscriptionPlan.findFirst({
            where: { id: planId, reseller_id: session.userId } as any
        });

        if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

        await prisma.subscriptionPlan.delete({ where: { id: planId } });
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
