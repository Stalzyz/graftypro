
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
            console.warn(`[AUTH-ERROR] Admin not found: ${email}`);
            return NextResponse.json({ error: "Invalid credentials (User not found)" }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, admin.password_hash);
        console.log(`[AUTH-DEBUG] Login attempt: email=${email}, role=${admin.role}, isValid=${isValid}`);

        if (!isValid) {
            console.warn(`[AUTH-ERROR] Password mismatch for: ${email}`);
            return NextResponse.json({ error: "Invalid credentials (Password mismatch)" }, { status: 401 });
        }

        // Create Session
        const token = await signAdminToken({
            id: admin.id,
            email: admin.email,
            role: admin.role
        });

        // Cookies Security (Handle Reverse Proxy)
        const forwardedProto = req.headers.get("x-forwarded-proto");
        const isClientHttps = forwardedProto === "https" || req.url.startsWith("https");

        cookies().set("admin_token", token, {
            httpOnly: true,
            secure: isClientHttps, // Only secure if actually HTTPS
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
