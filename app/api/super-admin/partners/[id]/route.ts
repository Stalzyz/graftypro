import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { SignJWT } from "jose";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const partner = await prisma.reseller.findUnique({
            where: { id: params.id },
            include: {
                vendors: {
                    select: { id: true, name: true, status: true, created_at: true }
                },
                // @ts-ignore
                ledger_entries: {
                    orderBy: { created_at: "desc" },
                    take: 10
                }
            }
        });

        if (!partner) return NextResponse.json({ error: "Not Found" }, { status: 404 });
        return NextResponse.json({ partner });

    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    // Impersonate action
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        if (body.action !== "impersonate") {
            return NextResponse.json({ error: "Unknown action" }, { status: 400 });
        }

        const partner = await prisma.reseller.findUnique({
            where: { id: params.id },
            select: { id: true, email: true, role: true, status: true }
        });

        if (!partner) return NextResponse.json({ error: "Partner not found" }, { status: 404 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || "reseller-secret");
        const token = await new SignJWT({ userId: partner.id, email: partner.email, role: "RESELLER", impersonated_by: session.id })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("1h")
            .sign(secret);

        // Audit
        try {
            // @ts-ignore
            await prisma.adminAuditLog.create({
                data: {
                    admin_id: session.id,
                    action: "IMPERSONATE_PARTNER",
                    resource: params.id,
                    details: { email: partner.email, role: partner.role }
                }
            });
        } catch { }

        return NextResponse.json({ token });

    } catch (e) {
        console.error("Impersonate Error:", e);
        return NextResponse.json({ error: "Impersonation failed" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { status, commission_pct, role, password, branding, action, amount, note } = body;

        // ── Action: Add Credits ──
        if (action === "add_credits") {
            // @ts-ignore
            await prisma.resellerLedger?.create({
                data: {
                    reseller_id: params.id,
                    type: "CREDIT",
                    amount: parseFloat(amount),
                    description: note || "Super Admin Credit",
                    created_at: new Date()
                }
            }).catch(() => { });
            await prisma.reseller.update({
                where: { id: params.id },
                data: { total_earnings: { increment: parseFloat(amount) } } as any
            });
            try {
                // @ts-ignore
                await prisma.adminAuditLog.create({ data: { admin_id: session.id, action: "ADD_PARTNER_CREDITS", resource: params.id, details: { amount, note } } });
            } catch { }
            return NextResponse.json({ success: true });
        }

        // ── Action: Settle Payout ──
        if (action === "settle_payout") {
            await prisma.reseller.update({
                where: { id: params.id },
                data: { paid_earnings: { increment: parseFloat(amount) } } as any
            });
            try {
                // @ts-ignore
                await prisma.adminAuditLog.create({ data: { admin_id: session.id, action: "SETTLE_PAYOUT", resource: params.id, details: { amount } } });
            } catch { }
            return NextResponse.json({ success: true });
        }

        // ── Branding update ──
        if (branding) {
            const updated = await prisma.reseller.update({
                where: { id: params.id },
                data: {
                    brand_name: branding.brand_name,
                    logo_url: branding.logo_url,
                    favicon_url: branding.favicon_url,
                    primary_color: branding.primary_color,
                    secondary_color: branding.secondary_color,
                    support_email: branding.support_email,
                    support_url: branding.support_url,
                    custom_domain: branding.custom_domain || null
                }
            });
            try {
                // @ts-ignore
                await prisma.adminAuditLog.create({ data: { admin_id: session.id, action: "UPDATE_PARTNER_BRANDING", resource: params.id, details: branding } });
            } catch { }
            return NextResponse.json({ success: true, partner: updated });
        }

        // ── Governance update ──
        const data: any = {};
        if (status) data.status = status;
        if (role) data.role = role;
        if (commission_pct) data.base_commission = parseFloat(commission_pct);

        if (password) {
            const bcrypt = await import("bcryptjs");
            data.password_hash = await bcrypt.hash(password, 10);
        }

        const updated = await prisma.reseller.update({ where: { id: params.id }, data });

        try {
            // @ts-ignore
            await prisma.adminAuditLog.create({
                data: {
                    admin_id: session.id,
                    action: "UPDATE_PARTNER",
                    resource: params.id,
                    details: { ...body, password: password ? "[REDACTED]" : undefined }
                }
            });
        } catch { }

        return NextResponse.json({ success: true, partner: updated });

    } catch (e) {
        console.error("Update Partner Error:", e);
        return NextResponse.json({ error: "Update Failed" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Audit before delete
        try {
            const partner = await prisma.reseller.findUnique({ where: { id: params.id }, select: { email: true, name: true } });
            // @ts-ignore
            await prisma.adminAuditLog.create({
                data: {
                    admin_id: session.id,
                    action: "DELETE_PARTNER",
                    resource: params.id,
                    details: { email: partner?.email, name: partner?.name }
                }
            });
        } catch { }

        await prisma.reseller.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("Delete Partner Error:", e);
        return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
    }
}
