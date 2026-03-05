
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const email = "admin@grafty.com";
        const password = "AdminPassword@123";
        const hash = await bcrypt.hash(password, 10);

        console.log("Forcing reset for:", email);

        // Delete existing to be safe
        await prisma.adminUser.deleteMany({
            where: { email }
        });

        // Create fresh
        const admin = await prisma.adminUser.create({
            data: {
                email,
                password_hash: hash,
                role: "SUPER_ADMIN",
                name: "Root Admin"
            }
        });

        return NextResponse.json({
            success: true,
            message: "ADMIN RE-CREATED SUCCESSFULLY",
            email: admin.email,
            password: password,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
