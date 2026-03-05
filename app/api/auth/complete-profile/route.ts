
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { verifyToken } from "../../../../lib/auth";
import { cookies } from "next/headers";

export async function POST(request: Request) {
    // Read token directly from cookie — middleware skips header injection for /api/auth/* routes
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    const userPayload = token ? await verifyToken(token) : null;

    if (!userPayload || !userPayload.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { businessName, mobile, location } = body;

        if (!businessName || !mobile || !location) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        // Update User phone
        await prisma.user.update({
            where: { id: userPayload.userId },
            data: { phone: mobile }
        });

        // Update Workspace name/timezone
        await prisma.workspace.update({
            where: { id: userPayload.workspaceId },
            data: {
                name: businessName,
                business_name: businessName,
                timezone: location === "India" ? "Asia/Kolkata" : "UTC"
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile Complete Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
