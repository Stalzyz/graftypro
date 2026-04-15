import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "../../../../lib/db";
import { getCurrentUser, verifyToken } from "../../../../lib/auth";
import { hash, compare } from "bcryptjs";
import { getAbsoluteMediaUrl } from "../../../../lib/utils/url";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const _cookieStore = cookies();
        const _token = _cookieStore.get("token")?.value;
        const userPayload = _token ? await verifyToken(_token) : null;
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userPayload.userId },
            select: {
                id: true,
                email: true,
                first_name: true,
                last_name: true,
                role: true,
                avatar_url: true,
                password_hash: true,
                email_otp_verified: true,
                workspace_id: true,
                job_title: true,
                phone: true,
                bio: true,
                workspace: {
                    select: {
                        name: true,
                        plan: true,
                        status: true,
                        current_plan_id: true,
                        plan_details: true,
                        billing_gstin: true,
                        billing_address: true,
                        bank_name: true,
                        account_number: true,
                        ifsc_code: true,
                        timezone: true,
                        addons: {
                            where: { status: "ACTIVE" },
                            include: { addon: true }
                        }
                    }
                }
            }
        }) as any;

        if (!user) {
            const response = NextResponse.json({ error: "User not found" }, { status: 401 });
            response.cookies.delete("token");
            return response;
        }

        // 🛡️ REFORMAT: Align Backend with UI Expectation
        // Ensure 'plan' is the full object that Dashboard hooks expect
        const formattedUser = {
            ...user,
            avatar_url: getAbsoluteMediaUrl(user.avatar_url, req),
            workspace: {
                ...user.workspace,
                // @ts-ignore
                plan: user.workspace.plan_details || { 
                    name: user.workspace.plan, // Fallback to enum string if relation missing
                    module_crm: user.workspace.plan === "ENTERPRISE" || user.workspace.plan === "PRO",
                    module_ecommerce: user.workspace.plan === "ENTERPRISE",
                    module_academy: user.workspace.plan === "ENTERPRISE",
                    module_drip: user.workspace.plan === "ENTERPRISE",
                    module_integration: user.workspace.plan === "ENTERPRISE"
                },
                addons: user.workspace.addons.map((wa: any) => wa.addon.name)
            },
            hasPassword: !!user.password_hash
        };

        // Remove the raw relation to avoid confusion
        // @ts-ignore
        delete formattedUser.workspace.plan_details;

        return NextResponse.json({
            user: formattedUser
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const _cookieStore = cookies();
        const _token = _cookieStore.get("token")?.value;
        const userPayload = _token ? await verifyToken(_token) : null;
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { first_name, last_name, job_title, phone, bio, avatar_url, workspace_name, current_password, new_password, email } = body;

        // Fetch current user details for password check
        const currentUser = await prisma.user.findUnique({
            where: { id: userPayload.userId }
        });

        if (!currentUser) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Password Update Logic
        if (new_password) {
            if (currentUser.password_hash) {
                // If password exists, require current password
                if (!current_password) {
                    return NextResponse.json({ error: "Current password is required" }, { status: 400 });
                }
                const isValid = await compare(current_password, currentUser.password_hash);
                if (!isValid) {
                    return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
                }
            }

            // --- STEP 1: Nuclear-Grade Password Validation ---
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
            if (!passwordRegex.test(new_password)) {
                return NextResponse.json({ 
                    error: "Password must be at least 10 characters long and include uppercase, lowercase, a number, and a special character (@$!%*?&)." 
                }, { status: 400 });
            }

            // Hash new password
            const hashedPassword = await hash(new_password, 10);
            await prisma.user.update({
                where: { id: userPayload.userId },
                data: { password_hash: hashedPassword }
            });
        }

        // Email Update Logic (Username)
        if (email && email !== currentUser.email) {
            // Check if email taken
            const existing = await prisma.user.findFirst({
                where: {
                    email: email,
                    workspace_id: userPayload.workspaceId
                }
            });
            if (existing) {
                return NextResponse.json({ error: "Email already taken in this workspace" }, { status: 400 });
            }
            await prisma.user.update({
                where: { id: userPayload.userId },
                data: { email }
            });
        }

        // Update Profile Fields
        await prisma.user.update({
            where: { id: userPayload.userId },
            data: {
                first_name,
                last_name,
                job_title,
                phone,
                bio,
                avatar_url
            }
        });

        // Update Workspace Name and Billing if provided
        if (workspace_name || body.billing_gstin || body.billing_address || body.bank_name || body.account_number || body.ifsc_code) {
            await prisma.workspace.update({
                where: { id: userPayload.workspaceId },
                data: {
                    name: workspace_name || undefined,
                    business_name: workspace_name || undefined,
                    billing_gstin: body.billing_gstin,
                    billing_address: body.billing_address,
                    bank_name: body.bank_name,
                    account_number: body.account_number,
                    ifsc_code: body.ifsc_code,
                    timezone: body.timezone || undefined
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
