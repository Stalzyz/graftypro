import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = 'force-dynamic';

/**
 * 🩺 LIVE WHATSAPP DIAGNOSTIC
 * Usage: Visit [domain]/api/diagnostic/whatsapp in your browser
 */
export async function GET() {
    try {
        // 1. Check Accounts
        const accounts = await prisma.whatsAppAccount.findMany({
            select: {
                id: true,
                display_name: true,
                phone_number: true,
                phone_number_id: true,
                integration_status: true,
                status: true,
                workspace: { select: { id: true, name: true } }
            }
        });

        // 2. Check Recent Audit Logs
        const logs = await prisma.integrationAuditLog.findMany({
            orderBy: { created_at: 'desc' },
            take: 10,
            include: {
                whatsapp_account: { select: { display_name: true } }
            }
        });

        // 3. Check Last 5 Inbound Messages
        const messages = await prisma.message.findMany({
            where: { direction: 'INBOUND' },
            orderBy: { created_at: 'desc' },
            take: 5,
            include: {
                workspace: { select: { name: true } }
            }
        });

        // 4. Check for Routing Failures
        const rejected = await prisma.integrationAuditLog.findMany({
            where: { action: 'WEBHOOK_ROUTING_FAILED' as any },
            orderBy: { created_at: 'desc' },
            take: 5
        });
        
        return NextResponse.json({
            status: "success",
            timestamp: new Date().toISOString(),
            systems: {
                database: "CONNECTED",
                meta_callback: "CONFIGURED"
            },
            registered_accounts: accounts.map(a => ({
                name: a.display_name,
                phone: a.phone_number,
                phone_id: a.phone_number_id,
                workspace: a.workspace?.name,
                status: a.status
            })),
            recent_audit_events: logs.map(l => ({
                time: l.created_at.toISOString(),
                account: l.whatsapp_account?.display_name,
                action: l.action,
                details: l.details
            })),
            rejected_payloads: rejected.map(r => ({
                time: r.created_at.toISOString(),
                reason: r.action,
                details: r.details
            })),
            last_received_messages: messages.map(m => ({
                received_at: m.created_at.toISOString(),
                workspace: m.workspace?.name,
                type: m.type,
                content: m.content
            }))
        });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message
        }, { status: 500 });
    }
}
