import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Missing credentials" },
                { status: 400 }
            );
        }

        // 1. Find User
        const user = await prisma.user.findFirst({
            where: { email },
            include: { workspace: true },
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // 2. Check Password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return NextResponse.json(
                { error: "Invalid credentials" },
                { status: 401 }
            );
        }

        // 3. Generate Token
        const token = signToken({
            userId: user.id,
            workspaceId: user.workspace_id,
            role: user.role,
        });

        return NextResponse.json({
            success: true,
            token,
            workspace: {
                id: user.workspace.id,
                name: user.workspace.name,
                business_name: user.workspace.business_name,
            },
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                first_name: user.first_name,
            },
        });

    } catch (error: any) {
        console.error("Login Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
