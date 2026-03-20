import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * ROBUST MANUAL VALIDATION
 * Replaces Zod due to environment permission restrictions.
 */
function validatePlan(body: any) {
    const errors: string[] = [];
    
    if (!body.name || typeof body.name !== 'string') errors.push("Valid name is required");
    if (typeof body.monthly_price !== 'number' || body.monthly_price < 0) errors.push("Monthly price must be a positive number");
    if (typeof body.max_contacts !== 'number') errors.push("Max contacts must be a number");
    if (typeof body.max_messages !== 'number') errors.push("Max messages must be a number");
    
    return {
        isValid: errors.length === 0,
        errors,
        data: {
            name: String(body.name || ""),
            description: String(body.description || ""),
            monthly_price: Number(body.monthly_price || 0),
            currency: String(body.currency || "INR"),
            max_contacts: Number(body.max_contacts || 0),
            max_messages: Number(body.max_messages || 0),
            max_flows: Number(body.max_flows || 0),
            is_featured: !!body.is_featured,
            badge_text: String(body.badge_text || ""),
            cta_label: String(body.cta_label || "Get Started"),
            module_crm: !!body.module_crm,
            module_ecommerce: !!body.module_ecommerce,
            module_academy: !!body.module_academy,
            module_integration: !!body.module_integration,
        }
    };
}

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const packages = await prisma.subscriptionPlan.findMany({
            where: {
                OR: [
                    { reseller_id: null },
                    { reseller_id: "" }
                ]
            },
            orderBy: { sort_order: 'asc' }
        });

        return NextResponse.json({ data: packages });
    } catch (error) {
        console.error("[GET_PACKAGES_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { isValid, errors, data } = validatePlan(body);

        if (!isValid) {
            return NextResponse.json({ error: "Validation Failed", details: errors }, { status: 400 });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                ...data,
                reseller_id: null,
                crm_access: data.module_crm,
                flow_logic_access: data.module_crm,
                commerce_access: data.module_ecommerce,
                flow_commerce_access: data.module_ecommerce,
                billing_cycle: "MONTHLY",
                is_public: true,
                sort_order: 0,
                max_users: 1
            }
        });

        return NextResponse.json(plan);
    } catch (error) {
        console.error("[POST_PACKAGE_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
