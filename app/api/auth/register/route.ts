import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { business_name, email, password } = body;

        if (!business_name || !email || !password) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // 1. Check if user already exists (globally unique email check for simplicity, 
        //    though our schema supports same email in diff workspaces, 
        //    for a new registration we usually want a fresh start).
        const existingUser = await prisma.user.findFirst({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "User with this email already exists" },
                { status: 409 }
            );
        }

        // 2. Transaction: Create Workspace + Owner
        const result = await prisma.$transaction(async (tx) => {
            // A. Create Workspace
            const workspace = await tx.workspace.create({
                data: {
                    name: business_name,
                    business_name: business_name,
                },
            });

            // B. Hash Password
            const hashedPassword = await bcrypt.hash(password, 10);

            // C. Create Owner
            const user = await tx.user.create({
                data: {
                    workspace_id: workspace.id,
                    email,
                    password_hash: hashedPassword,
                    role: "OWNER",
                    first_name: "Admin", // Default
                },
            });

            return { workspace, user };
        });

        // 3. Generate Token
        const token = signToken({
            userId: result.user.id,
            workspaceId: result.workspace.id,
            role: result.user.role,
        });

        return NextResponse.json({
            success: true,
            token,
            workspace: {
                id: result.workspace.id,
                name: result.workspace.name,
            },
            user: {
                id: result.user.id,
                email: result.user.email,
                role: result.user.role,
            },
        });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
