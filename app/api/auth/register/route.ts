
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { AuthSecurityService } from "../../../../lib/security/auth-utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, confirmPassword, mobile, location, businessName, firstName, lastName, referral } = body;

        // 1. Validate Inputs
        if (!email || !password || !confirmPassword || !mobile || !location || !businessName || !firstName || !lastName) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        // --- STEP 1: Nuclear-Grade Password Validation ---
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json({ 
                error: "Password must be at least 10 characters long and include uppercase, lowercase, a number, and a special character (@$!%*?&)." 
            }, { status: 400 });
        }

        const normalizedEmail = AuthSecurityService.normalizeEmail(email);

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // 2. Check Uniqueness
        const existingUser = await prisma.user.findFirst({
            where: { email: normalizedEmail } // removed workspace_id check as email should be globally unique for login? Schema says unique([workspace_id, email]). But normally for SaaS login email is unique globally or handled carefully.
            // Wait, schema has @@unique([workspace_id, email]). This allows same email in different workspaces.
            // But for a signup flow, we typically create a NEW workspace and user.
            // We should check if this email already exists in ANY workspace to avoid confusion in a multi-tenant app 
            // OR checks if it exists in the context of a "default" or "new" workspace flow.
            // Given the requirements "Map to existing user if email exists" for Google Login, 
            // for Registration it implies creating a new account.
            // If email exists, we should probably warn.
        });

        // Let's check generally if this email is already registered as a primary user (e.g. Owner/Admin)
        // Since schema allows multiple, we must be careful. 
        // For a seamless signup, we usually assume the user is creating a new Organization/Workspace.
        // Let's check if there is ANY user with this email.
        const userCount = await prisma.user.count({
            where: { email: normalizedEmail }
        });

        if (userCount > 0) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }

        // 3. Detect Partner Context
        const host = request.headers.get("x-request-host") || request.headers.get("host") || "";
        const { BrandingService } = await import("../../../../lib/branding/service");
        const partner = await BrandingService.getBrandingByDomain(host);

        // 4. Create Workspace & User
        const result = await prisma.$transaction(async (tx) => {
            // Check for existing trial lock to prevent trial reset gaming
            const existingLock = await tx.trialLock.findUnique({
                where: { email: normalizedEmail }
            });

            let finalTrialEndsAt: Date;

            if (existingLock) {
                // Return users existing trial end date (Fail-Proof)
                finalTrialEndsAt = existingLock.trial_ends_at;
                console.log(`[Trial Security] Re-applying existing trial for ${normalizedEmail}. Ends: ${finalTrialEndsAt}`);
            } else {
                // First time trial
                finalTrialEndsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                await tx.trialLock.create({
                    data: {
                        email: normalizedEmail,
                        trial_ends_at: finalTrialEndsAt
                    }
                });
            }

            // 1. Generate Referral Code for this new Workspace
            const referralCode = `${businessName.substring(0, 3).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;

            // 2. Check for Referrer
            let referredByWorkspaceId = null;
            if (referral) {
                const referrer = await tx.workspace.findUnique({
                    where: { referral_code: referral }
                });
                if (referrer) {
                    referredByWorkspaceId = referrer.id;
                    console.log(`[Referral Engine] Linked signup to referrer: ${referrer.name}`);
                }
            }

            // --- STEP 0: Resolve Default Plan (Hardening the Connection) ---
            const defaultPlan = await tx.subscriptionPlan.findFirst({
                where: { is_active: true },
                orderBy: { sort_order: 'asc' }
            });

            // Create Workspace with partner attribution and package linkage
            const workspace = await tx.workspace.create({
                data: {
                    name: businessName,
                    business_name: businessName,
                    timezone: location === "India" ? "Asia/Kolkata" : "UTC",
                    trial_ends_at: finalTrialEndsAt, 
                    reseller_id: partner?.reseller_id || null, // Link to partner if detected
                    referral_code: referralCode,
                    referred_by_id: referredByWorkspaceId,
                    current_plan_id: defaultPlan?.id || null,
                    plan: defaultPlan ? (["FREE", "PRO", "ENTERPRISE"].includes(defaultPlan.name.toUpperCase()) ? defaultPlan.name.toUpperCase() as any : "PRO") : "FREE"
                }
            });

            // --- STEP 1: RESELLER ATTRIBUTION (HARDENING) ---
            if (referral) {
                try {
                    const { ResellerService } = await import("../../../../lib/reseller/service");
                    // Atomic mapping within the same transaction context
                    await ResellerService.mapVendorToReseller(workspace.id, referral, undefined);
                    
                    // 🎯 Notify Partner (Background)
                    if (workspace.reseller_id) {
                        const { EmailService } = await import("../../../../lib/email/service");
                        EmailService.sendPartnerReferralAlert(workspace.reseller_id, businessName).catch(err => {
                            console.error("[Partner Referral Alert] Failed:", err);
                        });
                    }
                } catch (e) {
                    console.error("[Affiliate Engine] Attribution failed during signup:", e);
                    // We don't block signup if attribution fails, but it's logged
                }
            }

            const passwordHash = await AuthSecurityService.hashPassword(password);

            const user = await tx.user.create({
                data: {
                    workspace_id: workspace.id,
                    email: normalizedEmail,
                    password_hash: passwordHash,
                    role: "OWNER",
                    phone: mobile,
                    first_name: firstName,
                    last_name: lastName,
                    created_at: new Date(),
                }
            });

            const wallet = await tx.vendorWallet.create({
                data: {
                    workspace_id: workspace.id,
                    current_balance: 0.00,
                    total_purchased: 0.00,
                    total_used: 0.00,
                }
            });

            return { user, workspace, wallet };
        });

        // Generate Verification Token
        const verificationToken = uuidv4();

        // 5. Set Redis Token
        const { redis } = await import("../../../../lib/redis");
        await redis.set(`verify:${verificationToken}`, result.user.id, "EX", 86400); // 24 hours

        // 6. Send Verification Email
        const { EmailService } = await import("../../../../lib/email/service");

        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const finalHost = (process.env.NODE_ENV === "production" && host.includes("localhost"))
            ? "grafty.pro"
            : host;

        const verifyUrl = `${protocol}://${finalHost}/api/auth/verify?token=${verificationToken}`;

        await EmailService.sendSystemEmail({
            to: normalizedEmail,
            subject: partner ? `Verify your ${partner.brand_name} account` : "Verify your Grafty account",
            templateName: "VERIFY_EMAIL",
            context: {
                verification_url: verifyUrl,
                brand_name: partner?.brand_name || "Grafty",
                logo_url: partner?.logo_url || "/grafty_brand.svg"
            },
            hostname: finalHost
        });

        console.log(`[VERIFICATION] Email sent to ${normalizedEmail}`);

        // 6. Audit Log
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        await AuthSecurityService.logEvent({
            userId: result.user.id,
            email: normalizedEmail,
            action: "SIGNUP",
            status: "SUCCESS",
            ipAddress: ip,
            userAgent: request.headers.get("user-agent") || undefined
        });

        return NextResponse.json({
            success: true,
            message: "Registration successful. Please check your email to verify your account."
        });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
