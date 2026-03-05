
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { platformId: string } }) {
    try {
        const { platformId } = params;

        if (!platformId) {
            return NextResponse.json({ error: "Platform ID required" }, { status: 400 });
        }

        // Validate platform exists and is active
        const platform = await prisma.reseller.findUnique({
            where: { id: platformId },
            select: {
                id: true,
                brand_name: true,
                logo_url: true,
                primary_color: true,
                // @ts-ignore
                role: true,
                status: true
            }
        });

        // @ts-ignore
        if (!platform || platform.role !== "PLATFORM" || platform.status !== "APPROVED") {
            return NextResponse.json({ error: "Invalid or inactive platform" }, { status: 404 });
        }

        const plans = await prisma.subscriptionPlan.findMany({
            where: {
                // @ts-ignore
                reseller_id: platformId,
                is_active: true
            },
            orderBy: { monthly_price: 'asc' }
        });

        return NextResponse.json({
            platform: {
                name: platform.brand_name,
                logo: platform.logo_url,
                color: platform.primary_color
            },
            plans: plans.map(p => ({
                id: p.id,
                name: p.name.includes('_') ? p.name.split('_')[1] : p.name,
                description: p.description,
                monthly_price: p.monthly_price,
                yearly_price: p.yearly_price,
                max_users: p.max_users,
                max_contacts: p.max_contacts,
                features: {
                    flows: p.flow_builder_access,
                    commerce: p.commerce_access,
                    drip: p.drip_campaign_access,
                    crm: p.crm_access
                }
            }))
        });

    } catch (error) {
        console.error("Embed API Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
