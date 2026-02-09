import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { ResellerService } from "@/lib/reseller/service";

/**
 * PHASE 6: ADMIN PAYOUT PROCESSING API
 * Super Admin approves or rejects payout requests.
 */
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // 1. Authorization
        const admin = await requireSuperAdmin();
        const { id } = params;
        const body = await req.json();
        const { action, admin_notes } = body; // action: 'APPROVE' or 'REJECT'

        if (!['APPROVE', 'REJECT'].includes(action)) {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // 2. Process via Service
        const result = await ResellerService.processAdminPayoutAction(id, action, admin_notes);

        // 3. Logging (Phase 8: Audit)
        console.log(`[Reseller Engine] Payout ${id} ${action} by ${admin.email}`);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("Payout Processing Error:", error);
        return NextResponse.json({ error: error.message || "Processing failed" }, { status: 500 });
    }
}
