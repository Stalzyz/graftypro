import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { encrypt } from "../../../../lib/security/encryption";

export const dynamic = 'force-dynamic';
import axios from "axios";

// Meta API Version
const API_VER = "v18.0";

export async function POST(req: Request) {
    try {
        // 1. Authenticate Application User
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { code } = await req.json();
        if (!code) {
            return NextResponse.json({ error: "Missing OAuth code" }, { status: 400 });
        }

        // 1.5 Fetch Meta Credentials from SystemConfig (Priority) or .env (Fallback)
        const { SystemConfigService } = await import("../../../../lib/services/system-config-service");
        const config = await SystemConfigService.getConfig();
        const secrets = await SystemConfigService.getDecryptedSecrets();

        const APP_ID = config.meta_app_id || process.env.META_APP_ID;
        const APP_SECRET = secrets.meta_app_secret || process.env.META_APP_SECRET;

        // Validation for credentials
        if (!APP_ID || !APP_SECRET) {
            console.error("Meta Credentials Missing in SystemConfig and .env");
            return NextResponse.json({ error: "Server Misconfigured: Missing Meta Credentials. Please set them in Super Admin > Meta Architecture." }, { status: 500 });
        }

        // 2. Exchange Code for User Access Token
        console.log("Exchanging Code for Token...");
        const tokenRes = await axios.get(`https://graph.facebook.com/${API_VER}/oauth/access_token`, {
            params: {
                client_id: APP_ID,
                client_secret: APP_SECRET,
                code: code
            }
        });

        const accessToken = tokenRes.data.access_token;
        if (!accessToken) throw new Error("Failed to get Access Token from Meta");

        // 3. Get User's WABA (WhatsApp Business Accounts)
        console.log("Fetching WABA Details for user...");

        // We query 'me/businesses' to find the WABA shared with this App
        // This query navigates: Me -> Businesses -> Owned WABAs
        const wabaRes = await axios.get(`https://graph.facebook.com/${API_VER}/me`, {
            params: {
                access_token: accessToken,
                fields: "id,name,businesses{id,name,owned_whatsapp_business_accounts{id,name,currency}}"
            }
        });

        // Find the first valid WABA
        const businesses = wabaRes.data?.businesses?.data || [];

        let wabaId = "";
        let wabaName = "";

        for (const biz of businesses) {
            if (biz.owned_whatsapp_business_accounts?.data?.length > 0) {
                const waba = biz.owned_whatsapp_business_accounts.data[0];
                wabaId = waba.id;
                wabaName = waba.name;
                break;
            }
        }

        // Fallback: If no owned WABA, try looking for 'client_whatsapp_business_accounts' (common in embedded signup)
        if (!wabaId) {
            const clientWabaRes = await axios.get(`https://graph.facebook.com/${API_VER}/me`, {
                params: {
                    access_token: accessToken,
                    fields: "id,name,client_whatsapp_business_accounts{id,name,currency}"
                }
            });
            const clientWabas = clientWabaRes.data?.client_whatsapp_business_accounts?.data || [];
            if (clientWabas.length > 0) {
                wabaId = clientWabas[0].id;
                wabaName = clientWabas[0].name;
            }
        }

        if (!wabaId) {
            throw new Error("No WhatsApp Business Account (WABA) found linked to this Facebook User.");
        }

        console.log(`Found WABA: ${wabaId} (${wabaName})`);

        // 4. Get Phone Number ID
        console.log(`Fetching Phone Numbers for WABA: ${wabaId}`);
        const phoneRes = await axios.get(`https://graph.facebook.com/${API_VER}/${wabaId}/phone_numbers`, {
            params: {
                access_token: accessToken
            }
        });

        const phones = phoneRes.data.data;
        if (!phones || phones.length === 0) {
            throw new Error("No Phone Number found in this WABA. Please create a number in Meta Business Manager.");
        }

        // Pick the first phone number (MVP: Single Number Support)
        const primaryPhone = phones[0];
        const phoneId = primaryPhone.id;
        const displayPhone = primaryPhone.display_phone_number || primaryPhone.verified_name;
        const displayName = primaryPhone.verified_name || wabaName;

        // 5. Register Webhook (Subscribe App to WABA)
        try {
            await axios.post(`https://graph.facebook.com/${API_VER}/${wabaId}/subscribed_apps`, {}, {
                params: { access_token: accessToken }
            });
            console.log("Webhook Subscribed successfully");
        } catch (subError: any) {
            console.warn("Webhook subscription failed (non-critical if manually set):", subError.response?.data || subError.message);
        }

        // 6. Save to Database
        console.log(`Saving Account: ${phoneId} for Workspace: ${user.workspaceId}`);
        const encryptedToken = encrypt(accessToken);

        // De-conflict: If this phone is already registered to another workspace, remove it
        await prisma.whatsAppAccount.deleteMany({
            where: {
                phone_number_id: phoneId,
                workspace_id: { not: user.workspaceId }
            }
        });

        await prisma.whatsAppAccount.upsert({
            where: { workspace_id: user.workspaceId },
            update: {
                access_token: encryptedToken,
                waba_id: wabaId,
                phone_number_id: phoneId,
                phone_number: displayPhone,
                display_name: displayName,
                integration_status: "ACTIVE",
                health_status: "HEALTHY",
                status: "CONNECTED",
                validated_at: new Date()
            },
            create: {
                workspace_id: user.workspaceId,
                access_token: encryptedToken,
                waba_id: wabaId,
                phone_number_id: phoneId,
                phone_number: displayPhone,
                display_name: displayName,
                integration_status: "ACTIVE",
                health_status: "HEALTHY",
                status: "CONNECTED",
                validated_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            data: { wabaId, phoneId, phone: displayPhone }
        });

    } catch (error: any) {
        console.error("Onboarding Error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: error.response?.data?.error?.message || error.message || "Onboarding Failed" },
            { status: 500 }
        );
    }
}
