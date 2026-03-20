
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const resellerId = session.userId;

        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId },
            include: {
                sub_resellers: {
                    select: {
                        id: true,
                        name: true,
                        business_name: true,
                        created_at: true,
                        status: true,
                        role: true,
                        wallet_balance: true
                    }
                },
                vendor_mappings: {
                    include: {
                        reseller: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!reseller) return NextResponse.json({ error: "Not Found" }, { status: 404 });

        // Fetch detailed workspace info for mapped vendors
        const workspaceIds = reseller.vendor_mappings.map(m => m.workspace_id);
        const vendors = await prisma.workspace.findMany({
            where: { id: { in: workspaceIds } },
            select: {
                id: true,
                name: true,
                business_name: true,
                status: true,
                created_at: true,
                plan: true
            }
        });

        // Combine mappings with workspace details
        const referredVendors = reseller.vendor_mappings.map(mapping => {
            const workspace = vendors.find(v => v.id === mapping.workspace_id);
            return {
                ...mapping,
                workspace
            };
        });

        return NextResponse.json({
            referral_code: reseller.referral_code,
            stats: {
                total_vendors: reseller.vendor_mappings.length,
                total_partners: reseller.sub_resellers.length,
                total_earned: Number(reseller.total_earned)
            },
            vendors: referredVendors,
            partners: reseller.sub_resellers.map(p => ({
                ...p,
                wallet_balance: Number(p.wallet_balance || 0)
            }))
        });

    } catch (error) {
        console.error("Referrals Fetch Error:", error);
        return NextResponse.json({ error: "Load Failed" }, { status: 500 });
    }
}
