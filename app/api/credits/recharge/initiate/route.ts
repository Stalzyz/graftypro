/**
 * POST /api/credits/recharge/initiate
 * Creates a Razorpay order for credit recharge.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from "../../../../../lib/auth";
import { GSTService } from "../../../../../lib/finance/gst-service";
import { CreditService } from "../../../../../lib/credits/service";
import Razorpay from 'razorpay';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { amount, billingDetails } = body;

        // Validate amount
        if (!amount || amount < 100) {
            return NextResponse.json({ success: false, error: 'Minimum recharge amount is ₹100' }, { status: 400 });
        }
        if (amount > 1000000) {
            return NextResponse.json({ success: false, error: 'Maximum recharge amount is ₹10,00,000' }, { status: 400 });
        }

        if (!billingDetails) {
            return NextResponse.json({ success: false, error: 'Billing details are required' }, { status: 400 });
        }

        const required = ['name', 'address', 'state', 'pincode'];
        for (const field of required) {
            if (!billingDetails[field]?.trim()) {
                return NextResponse.json({ success: false, error: `${field} is required` }, { status: 400 });
            }
        }

        // Validate GSTIN if provided
        if (billingDetails.gstin && !GSTService.validateGSTIN(billingDetails.gstin)) {
            return NextResponse.json({ success: false, error: 'Invalid GSTIN format' }, { status: 400 });
        }

        // Calculate GST
        const gstBreakdown = await GSTService.calculateGST(amount, billingDetails.state);
        const orderAmount = Math.round(gstBreakdown.total_amount * 100); // paise

        // Create Razorpay order
        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("[Recharge] Missing Razorpay credentials in environment");
            return NextResponse.json({ success: false, error: 'Payment gateway not configured' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        let order;
        try {
            order = await razorpay.orders.create({
                amount: orderAmount,
                currency: 'INR',
                receipt: `rcpt_${user.workspaceId.slice(0, 8)}_${Date.now().toString().slice(-10)}`,
                notes: {
                    type: 'CREDIT_PURCHASE',
                    workspaceId: user.workspaceId,
                    netAmount: String(amount),
                    gstAmount: String(gstBreakdown.gst_total),
                    billingName: billingDetails.name,
                    billingAddress: billingDetails.address,
                    billingState: billingDetails.state,
                    billingPincode: billingDetails.pincode,
                    gstin: billingDetails.gstin || '',
                    email: billingDetails.email || '',
                    phone: billingDetails.phone || '',
                }
            });
        } catch (rzpError: any) {
            console.error("[Recharge] Razorpay Order Creation Error:", {
                message: rzpError.message,
                metadata: rzpError.metadata,
                stack: rzpError.stack,
                workspaceId: user.workspaceId
            });
            throw new Error(`Razorpay Error: ${rzpError.message || 'Failed to create order'}`);
        }

        console.log(`[Recharge] Razorpay order created: ${order.id} | Amount: ₹${gstBreakdown.total_amount} | Workspace: ${user.workspaceId}`);

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                amount: orderAmount,
                currency: 'INR',
                razorpay_key: process.env.RAZORPAY_KEY_ID,
            },
            calculation: {
                net_amount: gstBreakdown.net_amount,
                gst_total: gstBreakdown.gst_total,
                total_amount: gstBreakdown.total_amount,
                credits: CreditService.calculateRechargeCredits(amount), // Includes bonus logic
                is_same_state: gstBreakdown.is_same_state,
                formatted: {
                    net_amount: GSTService.formatINR(gstBreakdown.net_amount),
                    gst_total: GSTService.formatINR(gstBreakdown.gst_total),
                    total_amount: GSTService.formatINR(gstBreakdown.total_amount),
                }
            }
        });

    } catch (error: any) {
        console.error('[Recharge] Critical Initiation Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Failed to create payment order' }, { status: 500 });
    }
}
