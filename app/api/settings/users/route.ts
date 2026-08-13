import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { EmailService } from "../../../../lib/email/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const users = await prisma.user.findMany({
            where: { workspace_id: user.workspaceId },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
                created_at: true
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: users });
    } catch (error) {
        console.error("List Users Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check Subscription Limits
        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            include: {
                plan_details: true,
                _count: {
                    select: { users: true }
                }
            }
        });

        const maxUsers = workspace?.plan_details?.max_users || 1;
        if (workspace && workspace._count.users >= maxUsers) {
            return NextResponse.json({
                error: `User limit reached (${maxUsers}). Please upgrade your plan.`
            }, { status: 403 });
        }

        const { email, password, first_name, last_name, role } = await req.json();

        // Basic creation logic (should include password hashing etc if this were a full user system)
        // For now, let's keep it simple as requested

        const bcrypt = await import("bcryptjs");
        const hash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                workspace_id: user.workspaceId,
                email,
                password_hash: hash,
                first_name,
                last_name,
                role: role || "AGENT"
            }
        });

        // ✉️ Send agent invite email with login credentials
        try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.grafty.in";
            await EmailService.sendBrandedEmail(user.workspaceId, {
                to: email,
                subject: `You've been added as ${role || "AGENT"} — Login to get started`,
                templateName: "AGENT_INVITE",
                context: {
                    body_content: `
                        <div style="text-align: center;">
                            <h1 style="color: #111; font-size: 26px; margin-bottom: 8px;">
                                You're now part of the team 🎉
                            </h1>
                            <p style="color: #475569; font-size: 15px; margin-bottom: 32px; line-height: 1.6;">
                                Hi ${first_name || "there"}, you've been added to the workspace as <b>${role || "AGENT"}</b>.
                                Use the credentials below to log in.
                            </p>

                            <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 28px; text-align: left; margin-bottom: 28px;">
                                <p style="margin: 0 0 12px; color: #64748B; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Your Login Details</p>
                                <p style="margin: 0 0 8px; color: #1E293B; font-size: 15px;">
                                    <b>Email:</b> ${email}
                                </p>
                                <p style="margin: 0; color: #1E293B; font-size: 15px;">
                                    <b>Password:</b> ${password}
                                </p>
                            </div>

                            <p style="color: #94A3B8; font-size: 13px; margin-bottom: 28px;">
                                We recommend changing your password after your first login.
                            </p>

                            <a href="${appUrl}/login" style="background-color: #27954D; color: white; padding: 16px 36px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(39, 149, 77, 0.3);">
                                Login to Dashboard →
                            </a>
                        </div>
                    `
                }
            });
            console.log(`[AgentInvite] ✅ Invite email sent to ${email}`);
        } catch (emailErr: any) {
            console.error(`[AgentInvite] ⚠️ Failed to send invite email to ${email}:`, emailErr.message);
            // Don't fail the API call if email fails
        }

        return NextResponse.json({ success: true, data: newUser });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "User with this email already exists in this workspace" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
