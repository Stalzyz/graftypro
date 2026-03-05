import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const users = await prisma.user.findMany({
            where: { workspace_id: user.workspaceId },
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                role: true,
                created_at: true
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: users });
    } catch (error) {
        console.error("List Users Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check Subscription Limits
        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            include: {
                plan_details: true,
                _count: {
                    select: { users: true }
                }
            }
        });

        const maxUsers = workspace?.plan_details?.max_users || 1;
        if (workspace && workspace._count.users >= maxUsers) {
            return NextResponse.json({
                error: `User limit reached (${maxUsers}). Please upgrade your plan.`
            }, { status: 403 });
        }

        const { email, password, first_name, last_name, role } = await req.json();

        // Basic creation logic (should include password hashing etc if this were a full user system)
        // For now, let's keep it simple as requested

        const bcrypt = await import("bcryptjs");
        const hash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                workspace_id: user.workspaceId,
                email,
                password_hash: hash,
                first_name,
                last_name,
                role: role || "AGENT"
            }
        });

        return NextResponse.json({ success: true, data: newUser });

    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "User with this email already exists in this workspace" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
