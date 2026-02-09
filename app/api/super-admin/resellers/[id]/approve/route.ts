import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-auth";

/**
 * PHASE 1: ADMIN APPROVAL WORKFLOW
 * Only Super Admin can activate resellers.
 */
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Security First
        const admin = await requireSuperAdmin();
        const { id } = params;

        // 2. Verification
        const reseller = await prisma.reseller.findUnique({ where: { id } });
        if (!reseller) {
            return NextResponse.json({ error: "Reseller not found" }, { status: 404 });
        }

        if (reseller.status === "ACTIVE") {
            return NextResponse.json({ error: "Reseller is already active" }, { status: 400 });
        }

        // 3. Approval Operation
        const updated = await prisma.reseller.update({
            where: { id },
            data: {
                status: "ACTIVE",
                kyc_status: "VERIFIED", // Auto-verify on admin approval for now
            },
        });

        // 4. Intelligence Logging (Phase 8)
        // We would link to the ResellerAuditLog here
        console.log(`[Reseller Engine] Approved by ${admin.email}: ${reseller.name}`);

        return NextResponse.json({
            success: true,
            data: updated
        });

    } catch (error: any) {
        console.error("Reseller Approval Error:", error);
        return NextResponse.json({ error: error.message || "Approval failed" }, { status: 500 });
    }
}
