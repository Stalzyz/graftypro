/**
 * Calculate GST for recharge amount
 * 
 * POST /api/credits/recharge/calculate
 * 
 * Request:
 * {
 *   "amount": 10000,
 *   "state": "Karnataka"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "calculation": {
 *     "net_amount": 10000,
 *     "cgst": 900,
 *     "sgst": 900,
 *     "igst": 0,
 *     "gst_total": 1800,
 *     "total_amount": 11800
 *   }
 * }
 */

import { NextResponse } from 'next/server';
import { GSTService } from "../../../../../lib/finance/gst-service";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        // 1. Authenticate user
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // 2. Parse request
        const body = await req.json();
        const { amount, state } = body;

        // 3. Validate input
        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid amount. Must be greater than 0.' },
                { status: 400 }
            );
        }

        if (amount < 100) {
            return NextResponse.json(
                { success: false, error: 'Minimum recharge amount is ₹100' },
                { status: 400 }
            );
        }

        if (amount > 1000000) {
            return NextResponse.json(
                { success: false, error: 'Maximum recharge amount is ₹10,00,000' },
                { status: 400 }
            );
        }

        if (!state || state.trim() === '') {
            return NextResponse.json(
                { success: false, error: 'State is required for GST calculation' },
                { status: 400 }
            );
        }

        // 4. Calculate GST
        const calculation = await GSTService.calculateGST(amount, state);

        // 5. Return calculation
        return NextResponse.json({
            success: true,
            calculation: {
                net_amount: calculation.net_amount,
                cgst: calculation.cgst,
                sgst: calculation.sgst,
                igst: calculation.igst,
                gst_total: calculation.gst_total,
                total_amount: calculation.total_amount,
                is_same_state: calculation.is_same_state,
                formatted: {
                    net_amount: GSTService.formatINR(calculation.net_amount),
                    cgst: GSTService.formatINR(calculation.cgst),
                    sgst: GSTService.formatINR(calculation.sgst),
                    igst: GSTService.formatINR(calculation.igst),
                    gst_total: GSTService.formatINR(calculation.gst_total),
                    total_amount: GSTService.formatINR(calculation.total_amount)
                }
            }
        });

    } catch (error: any) {
        console.error('Recharge calculation error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
