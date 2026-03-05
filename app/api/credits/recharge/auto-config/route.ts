/**
 * Workspace Credit - Auto Top-up Configuration API
 * 
 * GET /api/credits/recharge/auto-config - Fetch settings
 * POST /api/credits/recharge/auto-config - Update settings
 */

import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = 'force-dynamic';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret");

async function getWorkspaceId() {
    const token = cookies().get("token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload.workspace_id as string;
    } catch (e) {
        return null;
    }
}

export async function GET(req: Request) {
    try {
        const workspaceId = await getWorkspaceId();
        if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const wallet = await prisma.vendorWallet.findUnique({
            where: { workspace_id: workspaceId },
            select: {
                auto_recharge_enabled: true,
                auto_recharge_threshold: true,
                auto_recharge_amount: true,
                razorpay_token_id: true,
                max_daily_velocity: true
            }
        });

        return NextResponse.json({
            success: true,
            config: wallet || {
                auto_recharge_enabled: false,
                auto_recharge_threshold: 500,
                auto_recharge_amount: 1000
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const workspaceId = await getWorkspaceId();
        if (!workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { enabled, threshold, amount } = body;

        // Validation
        if (amount < 500) return NextResponse.json({ error: "Min recharge amount is ₹500" }, { status: 400 });
        if (threshold < 100) return NextResponse.json({ error: "Min threshold is ₹100" }, { status: 400 });

        const updatedWallet = await prisma.vendorWallet.update({
            where: { workspace_id: workspaceId },
            data: {
                auto_recharge_enabled: enabled,
                auto_recharge_threshold: threshold,
                auto_recharge_amount: amount
            }
        });

        return NextResponse.json({
            success: true,
            message: "Auto top-up settings updated",
            config: {
                enabled: updatedWallet.auto_recharge_enabled,
                threshold: Number(updatedWallet.auto_recharge_threshold),
                amount: Number(updatedWallet.auto_recharge_amount)
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
