import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser, verifyToken } from "../../../../../lib/auth";
import bcrypt from "bcryptjs";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import { headers, cookies } from "next/headers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        const _cookieStore = cookies();
        const _token = _cookieStore.get("token")?.value;
        const userPayload = _token ? await verifyToken(_token) : null;
        if (!userPayload) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { password } = await req.json();

        if (!password || password.length < 8) {
            return NextResponse.json({ error: "High-integrity passcodes must be at least 8 characters." }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const updatedUser = await prisma.user.update({
            where: { id: userPayload.userId },
            data: {
                password_hash: hashedPassword
            }
        });

        await AuthSecurityService.logEvent({
            userId: userPayload.userId,
            email: updatedUser.email,
            action: "PASS_RESET",
            status: "SUCCESS",
            ipAddress: ip,
            userAgent,
            details: { type: "INITIAL_PASSWORD_SET" }
        });

        return NextResponse.json({ success: true, message: "Security credentials updated." });

    } catch (error) {
        console.error("SET PASSWORD ERROR:", error);
        return NextResponse.json({ error: "Failed to update security credentials." }, { status: 500 });
    }
}
