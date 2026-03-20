import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * PHASE 8: ADMIN RESELLER DETAIL
 */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin();
        const { id } = params;

        const reseller = await prisma.reseller.findUnique({
            where: { id },
            include: {
                tier: true,
                vendors: {
                    take: 50,
                    orderBy: { created_at: 'desc' }
                },
                ledger_entries: {
                    take: 50,
                    orderBy: { created_at: 'desc' }
                },
                risk_logs: {
                    orderBy: { created_at: 'desc' }
                },
                payout_requests: {
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        if (!reseller) {
            return NextResponse.json({ error: "Reseller not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: reseller
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Failed to fetch reseller details" }, { status: 500 });
    }
}

/**
 * PHASE 8: ADMIN CONTROLS (Manual Intervention)
 */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        await requireSuperAdmin();
        const { id } = params;
        const body = await req.json();

        // Whitelist allowed updates
        // Whitelist allowed updates
        const {
            base_commission, tier_id, is_frozen, freeze_reason, status, kyc_status,
            custom_domain, brand_name, logo_url, favicon_url, primary_color, secondary_color,
            role
        } = body;

        const updated = await prisma.reseller.update({
            where: { id },
            data: {
                ...(base_commission !== undefined && { base_commission }),
                ...(tier_id !== undefined && { tier_id }),
                ...(role !== undefined && { role }),
                ...(is_frozen !== undefined && { is_frozen }),
                ...(freeze_reason !== undefined && { freeze_reason }),
                ...(status !== undefined && {
                    status,
                    // If manually activated by admin, assume they are verified
                    ...(status === 'ACTIVE' ? { email_verified: true } : {})
                }),
                ...(kyc_status !== undefined && { kyc_status }),

                // Branding Config
                ...(custom_domain !== undefined && { custom_domain }),
                ...(brand_name !== undefined && { brand_name }),
                ...(logo_url !== undefined && { logo_url }),
                ...(favicon_url !== undefined && { favicon_url }),
                ...(primary_color !== undefined && { primary_color }),
                ...(secondary_color !== undefined && { secondary_color }),
            }
        });

        return NextResponse.json({
            success: true,
            data: updated
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
}
