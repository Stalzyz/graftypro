
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { redis } from "../../../../../lib/redis";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { signToken } from "../../../../../lib/auth";
import { revalidatePath } from "next/cache";
import { validateAdminVendorMutation } from "../../../../../lib/admin/guard";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const workspace = await prisma.workspace.findUnique({
            where: { id: params.id },
            include: {
                users: true,
                waba: true,
                plan_details: true,
                _count: {
                    select: {
                        messages: true,
                        campaigns: true,
                        contacts: true,
                        flows: true
                    }
                }
            }
        });

        if (!workspace) return NextResponse.json({ error: "Not Found" }, { status: 404 });

        // Calculate Stats
        // In a real app, we'd query historical data tables for graphs.
        // For MVP, we return strict counts.

        return NextResponse.json({ workspace });

    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

// UPDATE VENDOR (Plan, Status, Profile, Password)
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, plan, status, phone, password, current_plan_id } = body;

        // 🛡️ SECURITY GUARD: Ensure target exists and current admin is valid
        const targetWorkspace = await validateAdminVendorMutation(session, params.id);

        const updateData: any = {};
        if (name) {
            updateData.name = name;
            updateData.business_name = name;
        }

        // 🚀 PLAN SYNC LOGIC: Map custom plan names (like STARTER) to base Enum (FREE, PRO, ENTERPRISE)
        const normalizePlan = (name: string) => {
            const n = name.toUpperCase();
            if (n === "FREE") return "FREE";
            if (n === "ENTERPRISE") return "ENTERPRISE";
            // Map STARTER, BASIC, etc. to PRO/ENTERPRISE for legacy system support
            return "PRO"; 
        };

        if (current_plan_id) {
            updateData.current_plan_id = current_plan_id;
            const p = await prisma.subscriptionPlan.findUnique({ where: { id: current_plan_id } });
            if (p) {
                updateData.plan = normalizePlan(p.name);
            }
        } else if (plan) {
            const p = await prisma.subscriptionPlan.findFirst({ where: { name: { equals: plan, mode: 'insensitive' } } });
            if (p) {
                updateData.current_plan_id = p.id;
            }
            updateData.plan = normalizePlan(plan);
        }

        if (status) updateData.status = status;

        // Perform Update in Transaction
        const updated = await prisma.$transaction(async (tx) => {
            // Update Workspace
            const ws = await tx.workspace.update({
                where: { id: params.id },
                data: updateData
            });

            // 🐛 HARD FIX: Sync Status to Redis for INSTANT middleware enforcement
            if (status) {
                if (status === "SUSPENDED") {
                    await redis.set(`suspended:${params.id}`, "true", "EX", 60 * 60 * 24 * 7);
                } else if (status === "ACTIVE") {
                    await redis.del(`suspended:${params.id}`);
                }
            }

            // Update Owner Profile (Phone, Password)
            if (phone || password) {
                const owner = await tx.user.findFirst({
                    where: { workspace_id: params.id, role: "OWNER" }
                });

                if (owner) {
                    const data: any = {};
                    if (phone) data.phone = phone;
                    if (password) {
                        const hash = await require("bcryptjs").hash(password, 10);
                        data.password_hash = hash;
                    }

                    await tx.user.update({
                        where: { id: owner.id },
                        data
                    });
                }
            }

            return ws;
        });

        // 🚀 Cache Busters: Make sure the Dashboard reflects the change immediately
        try {
            revalidatePath("/dashboard");
            revalidatePath("/super-admin/dashboard/vendors");
        } catch (e) {
            console.warn("Revalidation failed:", e);
        }

        // Audit Log
        try {
            // @ts-ignore
            await prisma.adminAuditLog.create({
                data: {
                    admin_id: session.id,
                    action: "UPDATE_VENDOR",
                    resource: params.id,
                    details: { ...body, password: password ? "[REDACTED]" : undefined }
                }
            });
        } catch (auditError) {
            console.error("[Audit] Log creation failed (likely due to stale session auth fallback):", auditError);
        }

        return NextResponse.json({ success: true, workspace: updated });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Update Failed: " + e.message }, { status: 500 });
    }
}

// DELETE VENDOR
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Delete Workspace (Cascades to Users, Waba, etc.)
        await prisma.workspace.delete({
            where: { id: params.id }
        });

        // Audit Log
        // @ts-ignore
        await prisma.adminAuditLog.create({
            data: {
                admin_id: session.id,
                action: "DELETE_VENDOR",
                resource: params.id
            }
        });

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: "Deletion Failed" }, { status: 500 });
    }
}

// IMPERSONATION (The Magic Link)
export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        if (body.action === 'impersonate') {
            // Find the owner or first user
            const targetUser = await prisma.user.findFirst({
                where: { workspace_id: params.id }
            });

            if (!targetUser) return NextResponse.json({ error: "No users in workspace" }, { status: 400 });

            // Generate User Token
            const token = await signToken({
                userId: targetUser.id,
                workspaceId: targetUser.workspace_id,
                role: targetUser.role,
                impersonated_by: session.id // Security Audit Trail
            });

            // Audit Log
            // @ts-ignore
            await prisma.adminAuditLog.create({
                data: {
                    admin_id: session.id,
                    action: "IMPERSONATE_SESSION",
                    resource: targetUser.workspace_id,
                    details: { target_user: targetUser.email }
                }
            });

            return NextResponse.json({ token });
        }

        return NextResponse.json({ error: "Invalid Action" }, { status: 400 });

    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: "Impersonation Failed" }, { status: 500 });
    }
}
