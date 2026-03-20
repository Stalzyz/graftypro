import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { ResellerPayoutService } from "@/lib/reseller/payout-service";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const token = cookies().get("admin_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "ADMIN") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const payoutRequestId = params.id;

        const result = await ResellerPayoutService.executePayout(payoutRequestId, payload.userId);

        return NextResponse.json({
            success: true,
            message: "Payout processed successfully",
            data: result
        });

    } catch (error: any) {
        console.error("Payout Approval Error:", error);
        return NextResponse.json({ 
            error: error.message || "Failed to process payout" 
        }, { status: 500 });
    }
}
