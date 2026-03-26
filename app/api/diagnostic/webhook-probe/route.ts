import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

/**
 * 🔬 LIVE WEBHOOK PROBE
 * This endpoint captures every single request (GET + POST) from Meta
 * and stores it to the DB for inspection via the diagnostic API.
 * 
 * Deploy this, then test by:
 *   1. Visiting: http://72.61.231.187:3001/api/diagnostic/webhook-probe (GET) to see all captured hits
 *   2. Sending a WhatsApp message from your phone
 *   3. Refreshing the diagnostic page to see the captured payload
 */

// GET: Show all captured probes
export async function GET(req: Request) {
    try {
        const logs = await prisma.integrationAuditLog.findMany({
            where: { action: "WEBHOOK_PROBE_HIT" as any },
            orderBy: { created_at: "desc" },
            take: 20
        });

        return NextResponse.json({
            status: "PROBE_ACTIVE",
            total_captured: logs.length,
            hits: logs.map(l => ({
                time: l.created_at,
                details: l.details
            }))
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// POST: Log the raw incoming request from Meta
export async function POST(req: Request) {
    try {
        const body = await req.json().catch(() => ({}));
        const url = req.url;
        const headers = Object.fromEntries(req.headers.entries());

        console.log("🔬 [PROBE_HIT] POST received:", JSON.stringify(body).slice(0, 500));

        // Store in audit log for inspection
        await prisma.integrationAuditLog.create({
            data: {
                workspace_id: "PROBE",
                action: "WEBHOOK_PROBE_HIT" as any,
                details: {
                    type: "POST",
                    url,
                    body_preview: JSON.stringify(body).slice(0, 2000),
                    headers: {
                        "x-hub-signature": headers["x-hub-signature-256"] || "MISSING",
                        "user-agent": headers["user-agent"] || "UNKNOWN"
                    }
                }
            } as any
        }).catch(() => {});

        return NextResponse.json({ status: "captured" });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
