
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        const reseller = await prisma.reseller.findUnique({
            where: { email }
        });

        if (!reseller || !reseller.password_hash) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, reseller.password_hash);
        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Update last login
        await prisma.reseller.update({
            where: { id: reseller.id },
            data: { last_login: new Date() }
        });

        const token = await signToken({
            resellerId: reseller.id,
            email: reseller.email,
            role: "RESELLER"
        });

        const response = NextResponse.json({ success: true, name: reseller.name });

        response.cookies.set("partner_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });

        return response;

    } catch (error) {
        console.error("Reseller Login Error:", error);
        return NextResponse.json({ error: "Authentication Failed" }, { status: 500 });
    }
}
