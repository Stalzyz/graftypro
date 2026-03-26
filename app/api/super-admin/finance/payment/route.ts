import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const config = await prisma.systemConfig.findFirst({
            where: { id: "global" }
        });

        // Parse payment gateways, default to empty Razorpay config
        let gateways = [];
        try {
            if (config?.payment_gateways) {
                gateways = typeof config.payment_gateways === 'string'
                    ? JSON.parse(config.payment_gateways)
                    : config.payment_gateways;
            }
        } catch (e) {
            gateways = [];
        }

        if (!Array.isArray(gateways) || gateways.length === 0) {
            gateways = [{ provider: "Razorpay", key_id: "", key_secret: "", is_live: false, is_active: true }];
        }

        return NextResponse.json({ gateways });

    } catch (error: any) {
        console.error("Fetch Payment Config Error:", error);
        return NextResponse.json({ error: "Failed to fetch configuration" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { gateways } = body;

        if (!Array.isArray(gateways)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        const config = await prisma.systemConfig.findFirst({
            where: { id: "global" }
        });

        if (config) {
            await prisma.systemConfig.update({
                where: { id: "global" },
                data: {
                    payment_gateways: JSON.stringify(gateways) // Store as JSON string or depending on Prisma type
                }
            });
        } else {
            await prisma.systemConfig.create({
                data: {
                    id: "global",
                    payment_gateways: JSON.stringify(gateways)
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Save Payment Config Error:", error);
        return NextResponse.json({ error: "Failed to save configuration" }, { status: 500 });
    }
}
