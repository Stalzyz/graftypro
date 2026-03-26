import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        // 1. Try system config from DB
        const config = await prisma.systemConfig.findUnique({ where: { id: "global" } });
        
        let keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;

        if (config?.payment_gateways) {
            const gateways = typeof config.payment_gateways === 'string' 
                ? JSON.parse(config.payment_gateways) 
                : config.payment_gateways as any[];

            const rzp = Array.isArray(gateways) 
                ? gateways.find((g: any) => g.provider === "Razorpay") 
                : null;

            if (rzp?.key_id) {
                keyId = rzp.key_id;
            }
        }

        if (!keyId) {
            return NextResponse.json({ error: "No public key found" }, { status: 404 });
        }

        return NextResponse.json({ key_id: keyId });
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch key" }, { status: 500 });
    }
}
