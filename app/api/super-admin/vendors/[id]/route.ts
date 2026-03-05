
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { signToken } from "../../../../../lib/auth";

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
        const { plan, status, business_name, phone, password } = body;

        // Perform Update in Transaction
        const updated = await prisma.$transaction(async (tx) => {
            // Update Workspace
            const ws = await tx.workspace.update({
                where: { id: params.id },
                data: {
                    ...(plan && { plan }),
                    ...(status && { status }),
                    ...(business_name && { name: business_name, business_name })
                }
            });

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

        // Audit Log
        // @ts-ignore
        await prisma.adminAuditLog.create({
            data: {
                admin_id: session.id,
                action: "UPDATE_VENDOR",
                resource: params.id,
                details: { ...body, password: password ? "[REDACTED]" : undefined }
            }
        });

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
