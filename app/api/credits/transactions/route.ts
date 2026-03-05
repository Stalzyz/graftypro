/**
 * Get transaction history for workspace
 * 
 * GET /api/credits/transactions?page=1&limit=20&type=PURCHASE
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        // 1. Authenticate user
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Parse query parameters
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const type = searchParams.get('type'); // PURCHASE, DEDUCTION, or null for all

        const skip = (page - 1) * limit;

        // 3. Build where clause
        const where: any = {
            workspace_id: user.workspaceId
        };

        if (type) {
            where.type = type;
        }

        // 4. Fetch transactions
        const [transactions, total] = await Promise.all([
            prisma.creditTransaction.findMany({
                where,
                include: {
                    invoice: {
                        select: {
                            invoice_number: true,
                            pdf_url: true,
                            email_sent: true
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

        // 5. Format response
        const formattedTransactions = transactions.map(tx => ({
            id: tx.id,
            type: tx.type,
            amount: Number(tx.amount),
            balance_before: Number(tx.balance_before),
            balance_after: Number(tx.balance_after),

            // GST details
            net_amount: Number(tx.net_amount),
            gst_amount: Number(tx.gst_amount),
            cgst_amount: Number(tx.cgst_amount),
            sgst_amount: Number(tx.sgst_amount),
            igst_amount: Number(tx.igst_amount),
            total_amount: Number(tx.total_amount),

            // References
            payment_id: tx.related_payment_id,
            message_id: tx.related_message_id,
            invoice_number: tx.invoice?.invoice_number,
            invoice_pdf: tx.invoice?.pdf_url,

            // Metadata
            description: tx.description,
            status: tx.status,
            created_at: tx.created_at,

            // Message details (for deductions)
            message_category: tx.message_category,
            country_code: tx.country_code,
            meta_cost: Number(tx.meta_cost),
            our_charge: Number(tx.our_charge),
            margin: Number(tx.margin)
        }));

        return NextResponse.json({
            success: true,
            transactions: formattedTransactions,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error: any) {
        console.error('Transaction history error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch transactions' },
            { status: 500 }
        );
    }
}
