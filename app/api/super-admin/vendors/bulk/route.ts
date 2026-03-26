import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { redis } from "../../../../../lib/redis";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { revalidatePath } from "next/cache";
import { validateAdminVendorMutation } from "../../../../../lib/admin/guard";

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
            // 🛡️ SECURITY GUARD: Scope check for each ID in the batch
            await validateAdminVendorMutation(session, id);

            switch (action) {
                case "pause":
                    await prisma.workspace.update({
                        where: { id },
                        data: { status: "SUSPENDED" as any }
                    });
                    await redis.set(`suspended:${id}`, "true", "EX", 60 * 60 * 24 * 7); // Sync to Redis
                    break;

                case "activate":
                    await prisma.workspace.update({
                        where: { id },
                        data: { status: "ACTIVE" as any }
                    });
                    await redis.del(`suspended:${id}`); // Remove from Redis
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
                    await redis.set(`suspended:${id}`, "true", "EX", 60 * 60 * 24 * 7);
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
                    await redis.del(`suspended:${id}`);
                    break;

                case "hard_delete":
                    await prisma.workspace.delete({ where: { id } });
                    break;

                case "change_plan":
                    const planStr = (value || "").toUpperCase();
                    let enumVal = "PRO"; 
                    if (planStr === "FREE") enumVal = "FREE";
                    if (planStr === "ENTERPRISE") enumVal = "ENTERPRISE";
                    
                    await prisma.workspace.update({
                        where: { id },
                        data: { plan: enumVal as any }
                    });
                    break;

                case "add_credits":
                    const creditAmount = parseFloat(credits || "0");
                    if (creditAmount <= 0) throw new Error("Invalid credit amount");
                    
                    await prisma.$transaction(async (tx) => {
                        // 1. Update Wallet
                        const wallet = await tx.vendorWallet.upsert({
                            where: { workspace_id: id },
                            update: { 
                                current_balance: { increment: creditAmount },
                                total_purchased: { increment: creditAmount }
                            },
                            create: { 
                                workspace_id: id, 
                                current_balance: creditAmount,
                                total_purchased: creditAmount
                            }
                        });

                        // 2. Create Ledger Entry (The Missing Piece!)
                        await tx.creditTransaction.create({
                            data: {
                                workspace_id: id,
                                wallet_id: wallet.id,
                                type: 'PURCHASE',
                                amount: creditAmount,
                                balance_before: Number(wallet.current_balance) - creditAmount,
                                balance_after: Number(wallet.current_balance),
                                description: reason || `Manual Top-up by Admin (${session.email})`,
                                status: 'COMPLETED',
                                initiated_by: 'ADMIN' as any
                            }
                        });
                    });
                    break;

                case "remove_credits":
                    const debitAmount = parseFloat(credits || "0");
                    await prisma.$transaction(async (tx) => {
                        const wallet = await tx.vendorWallet.update({
                            where: { workspace_id: id },
                            data: { current_balance: { decrement: debitAmount } }
                        });

                        await tx.creditTransaction.create({
                            data: {
                                workspace_id: id,
                                wallet_id: wallet.id,
                                type: 'ADJUSTMENT' as any,
                                amount: -debitAmount,
                                balance_before: Number(wallet.current_balance) + debitAmount,
                                balance_after: Number(wallet.current_balance),
                                description: reason || `Manual Deduction by Admin (${session.email})`,
                                status: 'COMPLETED',
                                initiated_by: 'ADMIN' as any
                            }
                        });
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

    // 🚀 Refresh Cache
    try {
        revalidatePath("/dashboard");
        revalidatePath("/super-admin/dashboard/vendors");
    } catch {}

    return NextResponse.json({
        success: true,
        total: ids.length,
        succeeded: results.filter(r => r.success).length,
        failed: failed.length,
        errors: failed
    });
}
