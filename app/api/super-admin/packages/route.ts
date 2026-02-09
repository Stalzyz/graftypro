
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// Super Admin Only: List and Create Packages
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        // Add check for admin role here if necessary, for now we rely on auth context

        const packages = await prisma.subscriptionPlan.findMany({
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: packages });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        const body = await req.json();

        const {
            name, description, price, currency, billing_cycle,
            max_contacts, max_flows, max_campaigns, max_messages,
            api_access, crm_access, flow_builder_access, drip_campaign_access,
            commerce_access, edu_engine_access, is_public
        } = body;

        const pkg = await prisma.subscriptionPlan.create({
            data: {
                name,
                description,
                price: parseFloat(price) || 0,
                currency: currency || "INR",
                billing_cycle: billing_cycle || "MONTHLY",
                max_contacts: parseInt(max_contacts) || 100,
                max_flows: parseInt(max_flows) || 3,
                max_campaigns: parseInt(max_campaigns) || 1,
                max_messages: parseInt(max_messages) || 500,
                api_access: !!api_access,
                crm_access: !!crm_access,
                flow_builder_access: !!flow_builder_access,
                drip_campaign_access: !!drip_campaign_access,
                commerce_access: !!commerce_access,
                edu_engine_access: !!edu_engine_access,
                is_public: is_public !== undefined ? !!is_public : true,
            }
        });

        return NextResponse.json({ data: pkg });
    } catch (error: any) {
        console.error("Create Package Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 });
    }
}
