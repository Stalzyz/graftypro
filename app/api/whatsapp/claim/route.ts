import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { encrypt } from "../../../../lib/security/encryption";
import axios from "axios";

export const dynamic = 'force-dynamic';

const API_VER = "v20.0";

/**
 * CLAIM WABA ENDPOINT
 * This endpoint is called after the Embedded Signup flow to associate 
 * a newly created/shared WABA with the current workspace.
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Session expired. Please reload the page and try again." }, { status: 401 });
        }

        const { wabaId, accessToken } = await req.json();

        if (!wabaId || !accessToken) {
            return NextResponse.json({ error: "Missing WABA ID or Access Token" }, { status: 400 });
        }

        console.log(`[CLAIM] Attempting to claim WABA ${wabaId} for workspace ${user.workspaceId}`);

        // 1. Verify token and get Phone Number details
        const phoneRes = await axios.get(`https://graph.facebook.com/${API_VER}/${wabaId}/phone_numbers`, {
            params: { access_token: accessToken }
        });

        const phones = phoneRes.data.data;
        if (!phones || phones.length === 0) {
            return NextResponse.json({ error: "No phone numbers found in this WABA" }, { status: 404 });
        }

        const primaryPhone = phones[0];
        const phoneId = primaryPhone.id;
        const phoneNum = primaryPhone.display_phone_number;
        const displayName = primaryPhone.verified_name || "WhatsApp Business";

        // 2. Subscribe App to WABA Webhooks
        try {
            await axios.post(`https://graph.facebook.com/${API_VER}/${wabaId}/subscribed_apps`, {}, {
                params: { access_token: accessToken }
            });
        } catch (e: any) {
            console.warn("[CLAIM] Webhook subscription warning:", e.response?.data || e.message);
        }

        // 3. Save/Update WhatsAppAccount
        const encryptedToken = encrypt(accessToken);

        // Remove any existing association for this phone in other workspaces
        await prisma.whatsAppAccount.deleteMany({
            where: {
                phone_number_id: phoneId,
                workspace_id: { not: user.workspaceId }
            }
        });

        const account = await prisma.whatsAppAccount.upsert({
            where: { workspace_id: user.workspaceId },
            update: {
                waba_id: wabaId,
                phone_number_id: phoneId,
                phone_number: phoneNum,
                display_name: displayName,
                access_token: encryptedToken,
                integration_status: "ACTIVE",
                status: "CONNECTED",
                health_status: "HEALTHY",
                validated_at: new Date()
            },
            create: {
                workspace_id: user.workspaceId,
                waba_id: wabaId,
                phone_number_id: phoneId,
                phone_number: phoneNum,
                display_name: displayName,
                access_token: encryptedToken,
                integration_status: "ACTIVE",
                status: "CONNECTED",
                health_status: "HEALTHY",
                validated_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: "WABA claimed successfully",
            data: {
                waba_id: wabaId,
                phone_id: phoneId,
                phone_number: phoneNum
            }
        });

    } catch (error: any) {
        console.error("[CLAIM] Error:", error.response?.data || error.message);
        return NextResponse.json({
            error: error.response?.data?.error?.message || error.message || "Failed to claim WABA"
        }, { status: 500 });
    }
}
