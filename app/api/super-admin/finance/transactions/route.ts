/**
 * Super Admin - Global Transactions API
 * 
 * GET /api/super-admin/finance/transactions
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
        const limit = parseInt(searchParams.get('limit') || '50');
        const type = searchParams.get('type');
        const workspaceId = searchParams.get('workspaceId');
        const skip = (page - 1) * limit;

        const where: any = {};
        if (type) where.type = type;
        if (workspaceId) where.workspace_id = workspaceId;

        const [transactions, total] = await Promise.all([
            prisma.creditTransaction.findMany({
                where,
                include: {
                    wallet: {
                        include: {
                            workspace: {
                                select: {
                                    name: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    created_at: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.creditTransaction.count({ where })
        ]);

        return NextResponse.json({
            success: true,
            transactions: transactions.map(t => ({
                id: t.id,
                workspace_id: t.workspace_id,
                workspace_name: t.wallet?.workspace?.name || 'Unknown',
                type: t.type,
                amount: Number(t.amount),
                balance_before: Number(t.balance_before),
                balance_after: Number(t.balance_after),
                description: t.description,
                status: t.status,
                created_at: t.created_at,
                related_payment_id: t.related_payment_id,
                related_message_id: t.related_message_id
            })),
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error("Global Transactions Fetch Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch transactions" }, { status: 500 });
    }
}
