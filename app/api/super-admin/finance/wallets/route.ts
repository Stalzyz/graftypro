/**
 * Super Admin - Wallet Management API
 * 
 * GET /api/super-admin/finance/wallets
 * 
 * Returns a list of all vendor wallets with workspace details.
 */

import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await requireSuperAdmin();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        // Where clause for search
        const where: any = {};
        if (search) {
            where.OR = [
                { workspace: { name: { contains: search, mode: 'insensitive' } } },
                { billing_name: { contains: search, mode: 'insensitive' } },
                { gstin: { contains: search, mode: 'insensitive' } },
                { workspace_id: { equals: search } }
            ];
        }

        const [wallets, total] = await Promise.all([
            prisma.vendorWallet.findMany({
                where,
                include: {
                    workspace: {
                        select: {
                            id: true,
                            name: true,
                            reseller: {
                                select: {
                                    brand_name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    current_balance: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.vendorWallet.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            wallets: wallets.map(w => ({
                id: w.id,
                workspace_id: w.workspace_id,
                workspace_name: w.workspace.name,
                reseller: w.workspace.reseller?.brand_name || 'Direct',
                balance: Number(w.current_balance),
                purchased: Number(w.total_purchased),
                used: Number(w.total_used),
                is_frozen: w.is_frozen,
                billing_name: w.billing_name,
                gstin: w.gstin,
                created_at: w.created_at
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error("Super Admin Wallets Fetch Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch wallets" }, { status: 500 });
    }
}
