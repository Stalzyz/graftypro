
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * ONE-TIME SETUP ENDPOINT
 * Creates the Super Admin account if it doesn't exist.
 * IMPORTANT: Delete this file after first use, or it is protected by the secret key.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { setup_key, email, password } = body;

        // Guard with a secret key so random people can't call this
        const SETUP_KEY = process.env.ADMIN_SETUP_KEY || "grafty-setup-2026";
        if (setup_key !== SETUP_KEY) {
            return NextResponse.json({ error: "Invalid setup key" }, { status: 403 });
        }

        const targetEmail = email || "admin@grafty.com";
        const targetPassword = password || "Admin@123456";

        const hash = await bcrypt.hash(targetPassword, 12);

        const existing = await prisma.adminUser.findUnique({ where: { email: targetEmail } });

        if (existing) {
            // Reset password
            await prisma.adminUser.update({
                where: { email: targetEmail },
                data: { password_hash: hash, role: "SUPER_ADMIN", name: "Super Admin" }
            });
            return NextResponse.json({
                success: true,
                action: "password_reset",
                email: targetEmail,
                message: "Admin password has been reset."
            });
        }

        // Create fresh admin
        const admin = await prisma.adminUser.create({
            data: {
                email: targetEmail,
                password_hash: hash,
                role: "SUPER_ADMIN",
                name: "Super Admin"
            }
        });

        return NextResponse.json({
            success: true,
            action: "created",
            email: targetEmail,
            id: admin.id,
            message: "Super Admin created successfully. Delete this endpoint after use."
        });

    } catch (e: any) {
        console.error("Setup Error:", e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// Also allow GET to check if admin exists (without revealing password)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");
    const SETUP_KEY = process.env.ADMIN_SETUP_KEY || "grafty-setup-2026";

    if (key !== SETUP_KEY) {
        return NextResponse.json({ error: "Invalid key" }, { status: 403 });
    }

    const count = await prisma.adminUser.count();
    const admins = await prisma.adminUser.findMany({
        select: { id: true, email: true, role: true, name: true, created_at: true }
    });

    return NextResponse.json({ total: count, admins });
}
