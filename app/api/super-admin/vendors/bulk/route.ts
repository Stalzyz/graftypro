import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// BULK OPERATIONS — Extended
export async function PATCH(req: Request) {
    const session = await getAdminSession();
    if (!session || session.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { ids, action, value, credits, reason } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
    }

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const id of ids) {
        try {
            switch (action) {
                case "pause":
                    await prisma.workspace.update({
                        where: { id },
                        data: { status: "SUSPENDED" as any }
                    });
                    break;

                case "activate":
                    await prisma.workspace.update({
                        where: { id },
                        data: { status: "ACTIVE" as any }
                    });
                    break;

                case "soft_delete":
                    await prisma.workspace.update({
                        where: { id },
                        data: {
                            status: "SUSPENDED" as any,
                            settings: {
                                soft_deleted: true,
                                soft_deleted_at: new Date().toISOString(),
                                soft_deleted_by: session.id,
                                soft_delete_reason: reason || "Admin action"
                            }
                        }
                    });
                    break;

                case "restore":
                    const ws = await prisma.workspace.findUnique({ where: { id }, select: { settings: true } });
                    const s: any = ws?.settings || {};
                    delete s.soft_deleted;
                    delete s.soft_deleted_at;
                    delete s.soft_deleted_by;
                    await prisma.workspace.update({
                        where: { id },
                        data: { status: "ACTIVE" as any, settings: s }
                    });
                    break;

                case "hard_delete":
                    await prisma.workspace.delete({ where: { id } });
                    break;

                case "change_plan":
                    await prisma.workspace.update({
                        where: { id },
                        data: { plan: value as any }
                    });
                    break;

                case "add_credits":
                    await prisma.vendorWallet.upsert({
                        where: { workspace_id: id },
                        update: { current_balance: { increment: parseFloat(credits) } },
                        create: { workspace_id: id, current_balance: parseFloat(credits) }
                    });
                    break;

                case "remove_credits":
                    await prisma.vendorWallet.update({
                        where: { workspace_id: id },
                        data: { current_balance: { decrement: parseFloat(credits) } }
                    });
                    break;

                case "assign_partner":
                    await prisma.workspace.update({
                        where: { id },
                        data: { reseller_id: value }
                    });
                    break;

                case "remove_partner":
                    await prisma.workspace.update({
                        where: { id },
                        data: { reseller_id: null }
                    });
                    break;

                default:
                    throw new Error(`Unknown action: ${action}`);
            }

            results.push({ id, success: true });
        } catch (e: any) {
            results.push({ id, success: false, error: e.message });
        }
    }

    // Audit Log
    // @ts-ignore
    await prisma.adminAuditLog.create({
        data: {
            admin_id: session.id,
            action: `BULK_${action.toUpperCase()}`,
            resource: ids.join(","),
            details: { ids, action, value, credits, reason, results }
        }
    });

    const failed = results.filter(r => !r.success);
    return NextResponse.json({
        success: true,
        total: ids.length,
        succeeded: results.filter(r => r.success).length,
        failed: failed.length,
        errors: failed
    });
}
