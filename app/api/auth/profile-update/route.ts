import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { industry, message_volume, sell_products, needs_assistance, interested_in_reseller, use_api_already } = body;

        await prisma.workspace.update({
            where: { id: payload.workspaceId },
            data: {
                industry,
                message_volume,
                whatsapp_goal: sell_products ? "sell_products" : "automate_support",
                use_api_already,
                needs_assistance
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
