import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET() {
    try {
        const packages = [
            {
                name: "Starter Pro",
                monthly_price: 1999,
                yearly_price: 19990,
                description: "Perfect for small businesses starting with WhatsApp automation.",
                max_contacts: 5000,
                max_messages: 10000,
                max_flows: 10,
                module_crm: true,
                module_ecommerce: false,
            },
            {
                name: "Business Growth",
                monthly_price: 3999,
                yearly_price: 39990,
                description: "Advanced automation and commerce features for growing brands.",
                max_contacts: 20000,
                max_messages: 50000,
                max_flows: 50,
                module_crm: true,
                module_ecommerce: true,
                module_drip: true,
                is_featured: true,
            },
            {
                name: "Enterprise Elite",
                monthly_price: 14999,
                yearly_price: 149990,
                description: "The ultimate power-house for high-volume enterprises.",
                max_contacts: 100000,
                max_messages: 1000000,
                max_flows: 500,
                module_crm: true,
                module_ecommerce: true,
                module_integration: true,
                module_academy: true,
                module_drip: true,
                unlimited_messaging: true,
            }
        ];

        const results = [];

        for (const pkg of packages) {
            const existing = await prisma.subscriptionPlan.findFirst({
                where: { monthly_price: pkg.monthly_price }
            });

            if (existing) {
                results.push({ price: pkg.monthly_price, status: "EXISTING", name: existing.name });
                continue;
            }

            const created = await prisma.subscriptionPlan.create({
                data: {
                    name: pkg.name,
                    description: pkg.description,
                    monthly_price: pkg.monthly_price,
                    yearly_price: pkg.yearly_price,
                    max_contacts: pkg.max_contacts,
                    max_messages: pkg.max_messages,
                    max_flows: pkg.max_flows,
                    module_crm: pkg.module_crm,
                    module_ecommerce: pkg.module_ecommerce ?? false,
                    module_drip: pkg.module_drip ?? false,
                    module_academy: pkg.module_academy ?? false,
                    module_integration: pkg.module_integration ?? false,
                    is_featured: (pkg as any).is_featured ?? false,
                    unlimited_messaging: (pkg as any).unlimited_messaging ?? false,
                    currency: "INR",
                    gst_percentage: 18,
                    is_public: true,
                    setup_fee: 0,
                    trial_days: 7,
                    sort_order: pkg.monthly_price
                }
            });
            results.push({ price: pkg.monthly_price, status: "CREATED", name: created.name });
        }

        return NextResponse.json({ success: true, results });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
