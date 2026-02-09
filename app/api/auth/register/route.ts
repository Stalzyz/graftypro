import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { ResellerService } from "@/lib/reseller/service";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { business_name, full_name, email, password, phone, website, role } = body;
        let referral_code = body.referral_code;

        // --- OPTION B: REFERRAL COOKIE RESOLVER ---
        if (!referral_code) {
            const cookieStore = cookies();
            referral_code = cookieStore.get("res_referral_code")?.value;
        }

        if (!business_name || !email || !password || !phone || !full_name) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 1. Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // 2. Transaction: Create Workspace + Owner
        const result = await prisma.$transaction(async (tx) => {
            // A. Create Workspace
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 7);

            const workspace = await tx.workspace.create({
                data: {
                    name: business_name,
                    business_name: business_name,
                    website: website, // Added
                    trial_ends_at: trialEndsAt,
                    status: (role === "RESELLER_APPLICANT") ? "DARMANT" : "ACTIVE" // Pending approval if Reseller? Or just Active.
                },
            });

            // B. Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // C. Create Owner
            const user = await tx.user.create({
                data: {
                    workspace_id: workspace.id,
                    email,
                    phone: phone, // Added
                    password_hash: hashedPassword,
                    role: role === "RESELLER_APPLICANT" ? "OWNER" : "OWNER",
                    first_name: full_name,
                    phone_verified: new Date()
                },
            });

            return { workspace, user };
        });

        // --- PHASE 2/7: RESELLER MAPPING & FRAUD GUARD ---
        if (referral_code) {
            try {
                await ResellerService.mapVendorToReseller(result.workspace.id, referral_code);
            } catch (mappingError: any) {
                console.warn("⚠️ [Signup] Mapping Failed (Possbile Fraud/Lock):", mappingError.message);
                // We don't block registration if mapping fails, but we don't link the reseller
            }
        }

        // 3. Generate Token
        const token = await signToken({
            userId: result.user.id,
            workspaceId: result.workspace.id,
            role: result.user.role,
        });

        const response = NextResponse.json({
            success: true,
            workspace: {
                id: result.workspace.id,
                name: result.workspace.name,
            },
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
            },
        });

        // Set Cookie
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        // Clear Referral Cookie
        if (referral_code) {
            response.cookies.delete("res_referral_code");
        }

        return response;

        return response;

    } catch (error: any) {
        console.error("CRITICAL REGISTRATION ERROR:", {
            message: error.message,
            code: error.code,
            stack: error.stack,
            body: req.body // Log body summary if possible (careful with passwords)
        });
        return NextResponse.json(
            { error: `Registration Error: ${error.message || "Unknown error"}` },
            { status: 500 }
        );
    }
}
