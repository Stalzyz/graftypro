import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getResellerSession } from "../../../../lib/reseller/auth-helper";
import { ResellerFinanceEngine } from "../../../../lib/reseller/finance-engine";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const resellerId = session.userId;
        const body = await req.json();
        const { vendor_email, plan_id, vendor_name, business_name, password } = body;

        if (!vendor_email || !plan_id) {
            return NextResponse.json({ error: "Vendor email and plan selection are required." }, { status: 400 });
        }

        // 1. Verify Plan Ownership
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: plan_id }
        });

        if (!plan) return NextResponse.json({ error: "Selected plan does not exist." }, { status: 404 });

        // Ensure plan belongs to this reseller OR is a public system plan
        if (plan.reseller_id !== resellerId && !plan.is_public) {
            return NextResponse.json({ error: "Invalid plan selection." }, { status: 403 });
        }

        // 2. Escrow Deduction Transaction
        return await prisma.$transaction(async (tx) => {
            // A. Check if vendor already exists globally across the entire BSP
            let user = await tx.user.findUnique({
                where: { email: vendor_email }
            });

            if (!user) {
                // Hash simple password or generate one
                const bcrypt = require('bcryptjs');
                const hashedPassword = await bcrypt.hash(password || "default123", 10);

                user = await tx.user.create({
                    data: {
                        name: vendor_name || vendor_email.split('@')[0],
                        email: vendor_email,
                        password_hash: hashedPassword,
                        role: "USER"
                    }
                });
            }

            // B. Create the Workspace (Vendor Account) assigned to Reseller
            const workspace = await tx.workspace.create({
                data: {
                    name: business_name || `${user.name}'s Business`,
                    business_name: business_name,
                    industry: "Other",
                    timezone: "Asia/Kolkata",
                    phone_number: "",
                    reseller_id: resellerId,
                    plan_id: plan.id,
                    status: "ACTIVE", // Will only remain active if Escrow passes
                    users: {
                        create: {
                            user_id: user.id,
                            role: "OWNER"
                        }
                    }
                }
            });

            // C. Create Vendor Wallet
            const vendorWallet = await tx.vendorWallet.create({
                data: {
                    workspace_id: workspace.id,
                    current_balance: 0
                }
            });

            // D. Escrow Enforcement Layer
            // If the Partner is selling a plan with a Wholesale Cost, deduct it now.
            // If the Partner's wallet is empty, the transaction rolls back returning INSUFFICIENT_FUNDS.
            if (Number(plan.min_reseller_price) > 0) {
                await ResellerFinanceEngine.processPartnerSubscriptionDeduction(tx, {
                    resellerId: resellerId,
                    workspaceId: workspace.id,
                    wholesaleCost: Number(plan.min_reseller_price), // Wholesale Price (BSP Gets)
                    retailPrice: Number(plan.monthly_price),        // Retail Price (Partner Collected - just for stats)
                    planName: plan.name
                });
            }

            return NextResponse.json({
                success: true,
                message: "Vendor provisioned successfully. Escrow validation passed.",
                workspace_id: workspace.id
            });
        });

    } catch (error: any) {
        console.error("Vendor Subscription Provisioning Error:", error);

        // Check for our custom Escrow error
        if (error.message && error.message.includes("INSUFFICIENT_FUNDS")) {
            return NextResponse.json({
                error: error.message,
                code: "ESCROW_FAILURE"
            }, { status: 402 }); // 402 Payment Required
        }

        return NextResponse.json({ error: "Failed to provision vendor." }, { status: 500 });
    }
}
