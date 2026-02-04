import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import axios from "axios";

// POST /api/whatsapp/onboard - Exchange Code for Token
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code } = await req.json(); // The OAuth code from Meta SDK

        if (!code) {
            return NextResponse.json({ error: "Missing code" }, { status: 400 });
        }

        const APP_ID = process.env.META_APP_ID;
        const APP_SECRET = process.env.META_APP_SECRET;

        // 1. Exchange Code for Access Token
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${APP_ID}&client_secret=${APP_SECRET}&code=${code}`;
        const tokenRes = await axios.get(tokenUrl);
        const accessToken = tokenRes.data.access_token;

        // 2. Get WABA Details (Debug Token)
        const debugUrl = `https://graph.facebook.com/debug_token?input_token=${accessToken}&access_token=${accessToken}`;
        const debugRes = await axios.get(debugUrl);

        // In Embedded Signup, the scopes usually allow us to fetch the WABA ID linked to this user
        // For simplicity, we assume we fetch the first available WABA and Phone Number
        // A real implementation requires listing the WABAs and letting user pick one if multiple exist.

        // 3. Save to DB
        // We fetch the shared WABA ID (this part depends heavily on the specific permission scope granted)
        // Mocking the WABA ID extraction for now as it requires complex graph traversal
        const MOCK_WABA_ID = "123456789";
        const MOCK_PHONE_ID = "987654321";

        await prisma.whatsAppAccount.upsert({
            where: { workspace_id: user.workspaceId },
            update: {
                access_token: accessToken,
                status: "CONNECTED",
                waba_id: MOCK_WABA_ID,
                phone_number_id: MOCK_PHONE_ID,
                phone_number: "15550001" // In reality, fetch from API
            },
            create: {
                workspace_id: user.workspaceId,
                access_token: accessToken,
                waba_id: MOCK_WABA_ID,
                phone_number_id: MOCK_PHONE_ID,
                phone_number: "15550001",
                status: "CONNECTED",
                display_name: "My Business"
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Onboarding Error:", error.response?.data || error);
        return NextResponse.json(
            { error: "Onboarding Failed" },
            { status: 500 }
        );
    }
}
