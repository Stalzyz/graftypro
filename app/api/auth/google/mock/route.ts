import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function GET(req: Request) {
    // MOCK GOOGLE AUTH FLOW
    try {
        const { searchParams } = new URL(req.url);
        const forceNew = searchParams.get("new") === "true";

        // Consistent mock email for testing login, or random for testing registration
        const mockEmail = forceNew
            ? "google_user_" + Math.floor(Math.random() * 1000) + "@gmail.com"
            : "demo_google_user@gmail.com";

        // Check if exists
        let user = await prisma.user.findFirst({
            where: { email: mockEmail },
            include: { workspace: true }
        });

        let workspaceId = user?.workspace_id;

        if (!user) {
            // Create Mock User & Workspace
            const trialEndsAt = new Date();
            trialEndsAt.setDate(trialEndsAt.getDate() + 7);

            const workspace = await prisma.workspace.create({
                data: {
                    name: "Google Demo Workspace",
                    trial_ends_at: trialEndsAt
                }
            });
            workspaceId = workspace.id;

            user = await prisma.user.create({
                data: {
                    workspace_id: workspace.id,
                    email: mockEmail,
                    password_hash: "GOOGLE_OAUTH_MOCK",
                    first_name: "Google",
                    last_name: "Demo",
                    google_id: "mock_google_id_" + (forceNew ? Date.now() : "fixed_demo_id"),
                    email_verified: new Date(),
                    role: "OWNER"
                },
                include: { workspace: true }
            });
        }

        const token = await signToken({
            userId: user.id,
            workspaceId: workspaceId!,
            role: user.role,
        });

        // Redirect to dashboard if they already have an account setup, else profiling
        const protocol = req.headers.get("x-forwarded-proto") || "http";
        const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "app.grekam.in";
        const baseUrl = `${protocol}://${host}`;
        const targetUrl = new URL(targetPath, baseUrl);

        console.log(`🔄 Redirecting to ${targetUrl.toString()}`);
        const response = NextResponse.redirect(targetUrl);

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
            path: "/",
        });

        return response;

    } catch (e: any) {
        console.error("Google Mock Error", e.message);
        return NextResponse.json({ error: "Auth Failed" }, { status: 500 });
    }
}
