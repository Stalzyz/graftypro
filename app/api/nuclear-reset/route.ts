import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const demoEmail = "demo@grafty.com";
        const newPassword = "Demo@123";
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const user = await prisma.user.findFirst({
            where: { email: demoEmail }
        });

        if (!user) {
            return NextResponse.json({ success: false, message: "Demo user not found" }, { status: 404 });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { password_hash: hashedPassword }
        });

        return NextResponse.json({ success: true, message: "Demo user password reset successfully." });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
