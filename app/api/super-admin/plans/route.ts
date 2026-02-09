
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// Fetch current plans (mocking DB for now since we don't have a Plans table yet)
// In a full implementation, you'd have a 'Plan' model.
export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Since we don't have a Plans table, let's return a structured list from code
        // that matches what the frontend expected.
        const plans = [
            { id: "free", name: "Free Tier", price: 0, contacts: 100, campaigns: 1, status: "ACTIVE" },
            { id: process.env.RAZORPAY_PLAN_PRO || "plan_pro", name: "Pro Plan", price: 2999, contacts: 10000, campaigns: 100, status: "ACTIVE" },
            { id: process.env.RAZORPAY_PLAN_ENTERPRISE || "plan_ent", name: "Enterprise", price: 9999, contacts: 100000, campaigns: 1000, status: "ACTIVE" }
        ];

        return NextResponse.json({ plans });

    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
