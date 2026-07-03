
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { saasRazorpay } from "../../../../lib/saas/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { plan: planName, cycle = "monthly", couponCode } = await req.json();

        if (!planName) return NextResponse.json({ error: "Plan name is required" }, { status: 400 });

        // 1. Find plan from DB
        const dbPlan = await prisma.subscriptionPlan.findFirst({
            where: {
                name: { equals: planName, mode: "insensitive" },
                is_active: true,
            }
        });

        let razorpayPlanId: string | null = null;
        if (dbPlan) {
            razorpayPlanId = cycle === "yearly"
                ? (dbPlan as any).razorpay_yearly_plan_id
                : (dbPlan as any).razorpay_monthly_plan_id;
        }

        // 2. Handle Coupons & Offers
        let razorpayOfferId: string | undefined = undefined;
        let appliedCouponId: string | null = null;
        let couponType: 'GLOBAL' | 'RESELLER' | null = null;

        if (couponCode) {
            // Check Global
            const globalC = await prisma.globalCoupon.findUnique({ where: { code: couponCode.toUpperCase(), is_active: true } });
            if (globalC) {
                razorpayOfferId = globalC.razorpay_offer_id || undefined;
                appliedCouponId = globalC.id;
                couponType = 'GLOBAL';
            } else {
                // Check Reseller
                const workspace = await prisma.workspace.findUnique({ where: { id: user.workspaceId }, select: { reseller_id: true } });
                if (workspace?.reseller_id) {
                    const resellerC = await prisma.resellerCoupon.findFirst({
                        where: { code: couponCode.toUpperCase(), reseller_id: workspace.reseller_id, is_active: true }
                    });
                    if (resellerC) {
                        razorpayOfferId = resellerC.razorpay_offer_id || undefined;
                        appliedCouponId = resellerC.id;
                        couponType = 'RESELLER';
                    }
                }
            }
        }

        // 3. Fallback to env vars (legacy)
        if (!razorpayPlanId) {
            const planKey = planName.toUpperCase();
            const envMap: Record<string, string | undefined> = {
                LITE: process.env.RAZORPAY_PLAN_LITE,
                GROWTH: process.env.RAZORPAY_PLAN_GROWTH,
                PRO: process.env.RAZORPAY_PLAN_PRO,
                SCALE: process.env.RAZORPAY_PLAN_SCALE,
                ENTERPRISE: process.env.RAZORPAY_PLAN_ENTERPRISE,
            };
            razorpayPlanId = envMap[planKey] || null;
        }

        if (!razorpayPlanId && !dbPlan) {
            return NextResponse.json({
                error: `Plan "${planName}" has not been synced to Razorpay yet.`
            }, { status: 400 });
        }

        // If no ID exists in env, use a trigger ID to force JIT generation
        if (!razorpayPlanId && dbPlan) {
            razorpayPlanId = "plan_jit_trigger";
        }

        // 4. Create Razorpay Subscription with JIT Plan Creation Fallback
        let sub;
        try {
            sub = await saasRazorpay.subscriptions.create({
                plan_id: razorpayPlanId as string,
                customer_notify: 1,
                quantity: 1,
                total_count: cycle === "yearly" ? 10 : 120,
                addons: [],
                offer_id: razorpayOfferId, // Apply Razorpay Offer
                notes: { 
                    source: "grafty_bsp_saas", 
                    plan: planName, 
                    cycle,
                    coupon: couponCode || "none"
                }
            });
        } catch (subErr: any) {
            // Catch the "invalid ID" error and dynamically generate the plan
            if (subErr.error?.description?.includes("invalid") || subErr.error?.description?.includes("could not be found")) {
                console.log(`[JIT Provisioning] Generating new Razorpay Plan for ${planName}...`);
                
                const priceValue = cycle === "yearly" ? Number((dbPlan as any).yearly_price || 0) : Number((dbPlan as any).monthly_price || 0);
                if (priceValue <= 0) {
                     return NextResponse.json({ error: `Free plans do not require Razorpay subscriptions.` }, { status: 400 });
                }

                // Create plan in Razorpay
                const generatedPlan = await saasRazorpay.plans.create({
                    period: cycle === "yearly" ? "yearly" : "monthly",
                    interval: 1,
                    item: {
                        name: `${planName} (${cycle}) - Auto`,
                        amount: priceValue * 100, // in paise
                        currency: "INR",
                        description: `Auto-generated plan for ${planName}`
                    }
                });

                console.log(`[JIT Provisioning] Success! New Plan ID: ${generatedPlan.id}`);
                razorpayPlanId = generatedPlan.id;

                // Retry subscription creation with the valid generated Plan ID
                sub = await saasRazorpay.subscriptions.create({
                    plan_id: razorpayPlanId,
                    customer_notify: 1,
                    quantity: 1,
                    total_count: cycle === "yearly" ? 10 : 120,
                    addons: [],
                    offer_id: razorpayOfferId,
                    notes: { 
                        source: "grafty_bsp_saas", 
                        plan: planName, 
                        cycle,
                        coupon: couponCode || "none"
                    }
                });
            } else {
                throw subErr; // Throw other Razorpay errors natively
            }
        }

        // 5. Update workspace with pending subscription and coupon link
        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: {
                subscription_id: sub.id,
                subscription_status: "created",
                // Link coupon if applied
                global_coupon_id: couponType === 'GLOBAL' ? appliedCouponId : undefined,
                coupon_id: couponType === 'RESELLER' ? appliedCouponId : undefined
            }
        });

        // 4. Update workspace with pending subscription
        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: {
                subscription_id: sub.id,
                subscription_status: "created"
            }
        });

        return NextResponse.json({ subscriptionId: sub.id });

    } catch (error: any) {
        console.error("Subscription Error:", error);
        return NextResponse.json({
            error: error?.error?.description || error.message || "Failed to create subscription"
        }, { status: 500 });
    }
}
