
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

// CRITICAL: Disable Next.js caching for this route so every hit is live
export const dynamic = "force-dynamic";

/**
 * DEBUG ENDPOINT — Check login system environment.
 * Visit: /api/auth/debug-login
 * REMOVE THIS ENDPOINT ONCE LOGIN IS WORKING.
 */
export async function GET() {
    const checks: Record<string, any> = {};

    // 1. Check JWT_SECRET
    const jwtSecret = process.env.JWT_SECRET;
    checks.JWT_SECRET = jwtSecret
        ? `✅ Defined (length: ${jwtSecret.length})`
        : "❌ MISSING";

    // 2. Check DATABASE_URL (Masked)
    const dbUrl = process.env.DATABASE_URL || "";
    checks.DATABASE_URL_CONFIG = dbUrl 
        ? `✅ Defined (points to: ${dbUrl.split('@')[1] || 'unknown'})` 
        : "❌ MISSING";

    // 3. Check Database Connection
    try {
        const userCount = await prisma.user.count();
        checks.DATABASE_CONNECTION = `✅ Connected (${userCount} users in DB)`;
    } catch (e: any) {
        checks.DATABASE_CONNECTION = `❌ Failed: ${e.message}`;
    }

    // 5. Check NODE_ENV
    checks.NODE_ENV = process.env.NODE_ENV || "not set";

    // 6. Check NEXTAUTH_URL or NEXTAUTH_SECRET if used
    checks.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "not set";

    return NextResponse.json({
        message: "Login System Debug Report",
        timestamp: new Date().toISOString(),
        checks
    });
}
