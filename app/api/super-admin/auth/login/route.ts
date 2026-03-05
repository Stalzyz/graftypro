
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import { signAdminToken } from "../../../../../lib/admin-auth";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        // Check DB
        if (!prisma.adminUser) {
            console.error("CRITICAL: prisma.adminUser is undefined. Prisma client may need regeneration.");
            throw new Error("Database Schema Mismatch (AdminUser model missing)");
        }

        const admin = await prisma.adminUser.findUnique({
            where: { email }
        });

        if (!admin) {
            console.log(`[AUTH-DEBUG] No admin found for email: [${email}]`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, admin.password_hash);
        console.log(`[AUTH-DEBUG] Login attempt for: [${email}] | Exists: true | ValidPass: ${isValid}`);

        if (!isValid) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Create Session
        const token = await signAdminToken({
            id: admin.id,
            email: admin.email,
            role: admin.role
        });

        // Set Cookie
        // Behind a reverse proxy (Nginx), req.url is always http:// internally.
        // Use x-forwarded-proto to detect the actual client-facing protocol.
        const forwardedProto = req.headers.get("x-forwarded-proto");
        const isHttps = forwardedProto === "https" || req.url.startsWith("https") || process.env.NODE_ENV === "production";

        cookies().set("admin_token", token, {
            httpOnly: true,
            secure: isHttps,
            maxAge: 60 * 60 * 24, // 1 day
            path: "/",
            sameSite: "lax"
        });

        // Audit Log Login
        try {
            // @ts-ignore
            await prisma.adminAuditLog?.create({
                data: {
                    admin_id: admin.id,
                    action: "LOGIN",
                    ip_address: req.headers.get("x-forwarded-for") || "unknown"
                }
            });
        } catch (auditErr) {
            console.error("Audit log failed", auditErr);
        }

        return NextResponse.json({ success: true });

    } catch (e: any) {
        console.error("Admin Login Error", e);
        return NextResponse.json({
            error: "System Error",
            details: e.message,
            code: e.code
        }, { status: 500 });
    }
}
