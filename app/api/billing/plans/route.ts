
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const plans = await prisma.subscriptionPlan.findMany({
            where: { is_active: true, is_public: true },
            orderBy: { price: "asc" }
        });

        return NextResponse.json({ data: plans });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch plans" }, { status: 500 });
    }
}
