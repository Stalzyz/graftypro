import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession } from "../../../../lib/admin-auth";
import { signToken } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.redirect(new URL("/super-admin/login", req.url));
        }

        const { searchParams } = new URL(req.url);
        const partnerId = searchParams.get("id");

        if (!partnerId) {
            return NextResponse.json({ error: "Partner ID required" }, { status: 400 });
        }

        const partner = await prisma.reseller.findUnique({
            where: { id: partnerId },
            select: { id: true, email: true, role: true, status: true, name: true }
        });

        if (!partner) {
            return NextResponse.json({ error: "Partner not found" }, { status: 404 });
        }

        if (partner.status === "SUSPENDED") {
            return NextResponse.json({ error: "Cannot impersonate a suspended partner" }, { status: 403 });
        }

        // Generate token using the EXACT same signToken as the real partner login
        // Set impersonated_by so requireReseller() can detect and bypass email_verified check
        const token = await signToken({
            userId: partner.id,
            workspaceId: "partner_root",
            email: partner.email,
            role: "RESELLER",
            partnerRole: partner.role,
            impersonated_by: session.id,
            impersonation: true,
            // Mark email as verified so requireReseller() doesn't block
            email_verified: true,
        });

        // Audit log
        try {
            // @ts-ignore
            await prisma.adminAuditLog.create({
                data: {
                    admin_id: session.id,
                    action: "IMPERSONATE_PARTNER",
                    resource: partnerId,
                    details: {
                        partner_name: partner.name,
                        partner_email: partner.email,
                        partner_role: partner.role,
                        admin_id: session.id,
                    }
                }
            });
        } catch (auditErr) {
            console.warn("Audit log failed:", auditErr);
        }

        // Build the public redirect URL using Nginx-forwarded headers
        // (req.url is the internal localhost URL — we need the public domain)
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "grafty.pro";
        const proto = req.headers.get("x-forwarded-proto") || "https";
        const redirectUrl = `${proto}://${host}/partner/dashboard`;
        const response = NextResponse.redirect(redirectUrl);

        response.cookies.set("partner_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60, // 1 hour
            path: "/",
        });

        return response;

    } catch (e) {
        console.error("Impersonation error:", e);
        return NextResponse.json({ error: "Impersonation failed" }, { status: 500 });
    }
}
