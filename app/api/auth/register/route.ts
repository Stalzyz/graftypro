
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { AuthSecurityService } from "../../../../lib/security/auth-utils";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, confirmPassword, mobile, location, businessName, firstName, lastName } = body;

        // 1. Validate Inputs
        if (!email || !password || !confirmPassword || !mobile || !location || !businessName || !firstName || !lastName) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
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

        // 3. Create Workspace & User
        // Use a transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create Workspace
            const workspace = await tx.workspace.create({
                data: {
                    name: businessName,
                    business_name: businessName,
                    timezone: location === "India" ? "Asia/Kolkata" : "UTC",
                    trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7-day trial
                }
            });

            // Hash Password
            const passwordHash = await AuthSecurityService.hashPassword(password);

            // Create User
            const verificationToken = uuidv4();
            // Store verification token in Redis or Database? 
            // Schema has `email_verified` (DateTime).
            // It doesn't seem to have a `verification_token` field on User.
            // I should stick to the existing schema if possible, or use `RememberMeToken` or add a field.
            // Wait, there is no `verification_token` in `User` model.
            // I can use `RememberMeToken` model generic usage or add a field.
            // Or store it in Redis. `redis.setEx(`verify:${token}`, 3600, email)`.

            // Let's use Redis for verification tokens as it's cleaner and "clean signup" was requested.
            // But wait, "Store user" is a requirement.

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

            // --- 100-Credit Trial Injection ---
            const wallet = await tx.vendorWallet.create({
                data: {
                    workspace_id: workspace.id,
                    current_balance: 100.00,
                    total_purchased: 0.00, // Important: 0 indicates they haven't bought a paid plan yet
                    total_used: 0.00,
                }
            });

            await tx.creditTransaction.create({
                data: {
                    workspace_id: workspace.id,
                    wallet_id: wallet.id,
                    type: "ADJUSTMENT",
                    amount: 100.00,
                    balance_before: 0.00,
                    balance_after: 100.00,
                    description: "Free Trial Welcome Bonus (100 Credits)",
                    status: "COMPLETED",
                    initiated_by: "SYSTEM"
                }
            });

            return { user, workspace, verificationToken, wallet };
        });


        // 4. Set Redis Token
        const { redis } = await import("../../../../lib/redis");
        await redis.set(`verify:${result.verificationToken}`, result.user.id, "EX", 86400); // 24 hours

        // 5. Send Verification Email
        const { EmailService } = await import("../../../../lib/email/service");

        // Dynamically construct verification URL based on the incoming request's host/origin.
        // We use headers to ensure correct protocol (https) and host (grafty.pro) even when proxied.
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const host = request.headers.get("host") || "grafty.pro";

        // Safety: If host is still localhost in production, force the main domain
        const finalHost = (process.env.NODE_ENV === "production" && host.includes("localhost"))
            ? "grafty.pro"
            : host;

        const verifyUrl = `${protocol}://${finalHost}/api/auth/verify?token=${result.verificationToken}`;

        await EmailService.sendSystemEmail({
            to: normalizedEmail,
            subject: "Verify your Grafty account",
            templateName: "VERIFY_EMAIL",
            context: {
                verification_url: verifyUrl
            }
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
