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
        const vendorId = searchParams.get("id");

        if (!vendorId) {
            return NextResponse.json({ error: "Vendor ID required" }, { status: 400 });
        }

        // Find the workspace (vendor) and their owner user
        const workspace = await prisma.workspace.findUnique({
            where: { id: vendorId },
            select: { id: true, name: true, status: true }
        });

        if (!workspace) {
            return NextResponse.json({ error: "Vendor not found" }, { status: 404 });
        }

        // Find the OWNER user for this workspace
        const ownerUser = await prisma.user.findFirst({
            where: { workspace_id: vendorId, role: "OWNER" },
            select: { id: true, email: true, role: true }
        });

        if (!ownerUser) {
            return NextResponse.json({ error: "No owner user found for this vendor" }, { status: 404 });
        }

        // Generate token using EXACT same signToken as real vendor login
        const token = await signToken({
            userId: ownerUser.id,
            workspaceId: vendorId,
            role: ownerUser.role || "OWNER",
            email: ownerUser.email,
            impersonated_by: session.id,
            impersonation: true,
        });

        // Audit log
        try {
            // @ts-ignore
            await prisma.adminAuditLog.create({
                data: {
                    admin_id: session.id,
                    action: "IMPERSONATE_VENDOR",
                    resource: vendorId,
                    details: {
                        vendor_name: workspace.name,
                        owner_email: ownerUser.email,
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
        const redirectUrl = `${proto}://${host}/dashboard`;
        const response = NextResponse.redirect(redirectUrl);

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60, // 1 hour
            path: "/",
        });

        return response;

    } catch (e) {
        console.error("Vendor impersonation error:", e);
        return NextResponse.json({ error: "Impersonation failed" }, { status: 500 });
    }
}
