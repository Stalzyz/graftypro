import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { decrypt } from "../../../../../lib/security/encryption";
import axios from "axios";

export const dynamic = "force-dynamic";

const META_API = "https://graph.facebook.com/v20.0";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Session expired. Please reload the page and try again." }, { status: 401 });
        }

        const account = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!account) {
            return NextResponse.json({ error: "No WhatsApp connection found" }, { status: 404 });
        }

        const token = decrypt(account.access_token);
        const phoneNumberId = account.phone_number_id;
        const wabaId = account.waba_id;

        let displayName = account.display_name;
        let phoneNumber = account.phone_number;
        let qualityRating = account.quality_rating;
        let picUrl = account.profile_picture_url;

        // MULTI-STAGE FALLBACK IDENTITY RESOLVER 🛡️
        try {
            // Stage 1: The WABA Node (Highest Quality, Highest Permission)
            try {
                const wabaRes = await axios.get(`${META_API}/${wabaId}/phone_numbers`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const phones: any[] = wabaRes.data?.data || [];
                const match = phones.find((p: any) => p.id?.toString() === phoneNumberId.toString());

                if (match) {
                    displayName = match.verified_name || displayName;
                    phoneNumber = match.display_phone_number || phoneNumber;
                    qualityRating = match.quality_rating || qualityRating;
                }
            } catch (stage1Err) {
                // Stage 2: The Direct Phone Node (Works on older Graph APIs with basic scope)
                const phoneRes = await axios.get(`${META_API}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating`, {
                    headers: { Authorization: `Bearer ${token}` }
                }).catch(() => null);

                if (phoneRes?.data?.display_phone_number) {
                    phoneNumber = phoneRes.data.display_phone_number;
                    displayName = phoneRes.data.verified_name || displayName;
                    qualityRating = phoneRes.data.quality_rating || qualityRating;
                } else {
                    // Stage 3: Grab the WABA name at least if everything else fails
                    const wabaBaseRes = await axios.get(`${META_API}/${wabaId}?fields=name`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }).catch(() => null);
                    if (wabaBaseRes?.data?.name) {
                        displayName = wabaBaseRes.data.name;
                    }
                }
            }
        } catch (e) {
            console.warn("[Sync] All identity stages failed");
        }

        // NUCLEAR DIAGNOSTIC: ENFORCE APP SUBSCRIPTION 📡
        // If the token lacks whatsapp_business_management, this will fail. 
        // If it fails, Meta will NEVER send messages to the webhook. We need to expose this to the UI!
        let isWebhookSubscribed = false;
        try {
            await axios.post(`${META_API}/${wabaId}/subscribed_apps`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            isWebhookSubscribed = true;
            console.log(`[Sync] App Webhook successfully subscribed to WABA ${wabaId}`);
        } catch (subErr: any) {
            console.warn("[Sync] App Subscription Failed! Webhooks are BLOCKED:", subErr.response?.data?.error?.message);
        }

        // Also try fetching the business profile (profile picture, about)
        // This endpoint uses a different permission and is safe to call separately.
        try {
            const profileRes = await axios.get(
                `${META_API}/${phoneNumberId}/whatsapp_business_profile?fields=about,address,description,email,profile_picture_url,websites,vertical`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            if (profileRes.data?.data?.[0]) {
                const p = profileRes.data.data[0];
                picUrl = p.profile_picture_url || picUrl;
            }
        } catch (e: any) {
            console.warn("[Sync] Profile advanced fetch failed (Ignored)", e.response?.data?.error?.message);
        }

        const finalUpdate = await prisma.whatsAppAccount.update({
            where: { id: account.id },
            data: { 
                display_name: displayName,
                phone_number: phoneNumber,
                quality_rating: qualityRating,
                profile_picture_url: picUrl,
                updated_at: new Date(),
                status: (isWebhookSubscribed ? "CONNECTED" : "WARNING") as any,
                integration_status: (isWebhookSubscribed ? "ACTIVE" : "PENDING")  as any
            }
        });

        if (!isWebhookSubscribed) {
            return NextResponse.json({
                error: "Webhook Subscription Blocked",
                details: "Your Access Token lacks the 'whatsapp_business_management' permission. Meta is actively blocking messages from reaching your Grafty server. You MUST generate a new Permanent System Token with both 'whatsapp_business_messaging' AND 'whatsapp_business_management' checked."
            }, { status: 403 });
        }

        return NextResponse.json({ success: true, data: finalUpdate });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
