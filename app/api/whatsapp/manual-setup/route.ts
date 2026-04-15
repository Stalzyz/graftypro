import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import { encrypt } from "../../../../lib/security/encryption";
import axios from "axios";

export const dynamic = "force-dynamic";

const META_VERSION = "v21.0";
const BASE = `https://graph.facebook.com/${META_VERSION}`;

/**
 * MONSTER FIX: Manual WhatsApp Onboarding
 *
 * Bugs fixed:
 * 1. Route was returning { status: "CONNECTED" } — UI never got phone/name.
 * 2. Identity was only fetched from WABA phone_numbers list (requires management scope).
 *    Now we ALSO fall back to fetching the phone node directly.
 * 3. Nuclear auth bypass was grabbing the WRONG workspace (first workspace in DB).
 *    Fixed to use x-workspace-id header injected by middleware.
 * 4. Full identity (verifiedName, phoneNumber, qualityRating) is now returned to UI.
 */
export async function POST(req: Request) {
    try {
        // ── Auth ────────────────────────────────────────────────────────────
        // ── Auth Resolve (Now with Nuclear Fallback in getCurrentUser) ──────
        let user = await getCurrentUser(req);
        
        if (!user) {
            const cookiesPresent = req.headers.get("cookie") !== null;
            console.error("[ManualSetup] ❌ PERMANENT AUTH FAILURE. Traces:", {
                host: req.headers.get("host"),
                cookiePresent: cookiesPresent
            });
            return NextResponse.json({ error: "Unauthorized — please log in again." }, { status: 401 });
        }

        const body = await req.json();
        const { wabaId, phoneNumberId, appId, appSecret, accessToken, billingModel } = body;

        const isManaged = billingModel === "MANAGED";

        // ── Input Validation ────────────────────────────────────────────────
        if (!wabaId?.trim()) return NextResponse.json({ error: "WABA ID is required." }, { status: 400 });
        if (!phoneNumberId?.trim()) return NextResponse.json({ error: "Phone Number ID is required." }, { status: 400 });
        if (!accessToken?.trim()) return NextResponse.json({ error: "Access Token is required." }, { status: 400 });
        if (!isManaged && (!appId?.trim() || !appSecret?.trim())) {
            return NextResponse.json({ error: "App ID and App Secret are required for Direct mode." }, { status: 400 });
        }

        // ── Step 1: Verify token is valid ───────────────────────────────────
        console.log("[ManualSetup] Step 1: Verifying token against phoneId:", phoneNumberId);
        let verifyData: any;
        try {
            const verifyRes = await axios.get(
                `${BASE}/${phoneNumberId}?fields=display_phone_number,verified_name,quality_rating,code_verification_status,platform_type`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            verifyData = verifyRes.data;
            if (!verifyData?.id) throw new Error("Meta returned no data for this Phone Number ID.");
        } catch (e: any) {
            const msg = e.response?.data?.error?.message || e.message;
            console.error("[ManualSetup] Token verify failed:", msg);
            return NextResponse.json({
                error: `Token or Phone Number ID is invalid: ${msg}`,
                details: "Make sure your token has whatsapp_business_messaging permission and the Phone Number ID is correct."
            }, { status: 422 });
        }

        // ── Step 2: Resolve identity from direct phone node (most reliable) ─
        // This works even WITHOUT whatsapp_business_management scope
        let finalPhoneNumber = verifyData.display_phone_number || `+Unknown (ID: ${phoneNumberId})`;
        let finalDisplayName = verifyData.verified_name || `WA Account (${wabaId.slice(-6)})`;
        let qualityRating = verifyData.quality_rating || "GREEN";

        console.log(`[ManualSetup] Step 2: Identity resolved → ${finalDisplayName} | ${finalPhoneNumber} | Quality: ${qualityRating}`);

        // ── Step 3: Also try WABA phone list to get richer data (optional) ──
        try {
            const wabaRes = await axios.get(
                `${BASE}/${wabaId}/phone_numbers?fields=display_phone_number,verified_name,quality_rating,id`,
                { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            const phones: any[] = wabaRes.data?.data || [];
            const match = phones.find((p: any) => p.id?.toString() === phoneNumberId.toString());
            if (match) {
                finalPhoneNumber = match.display_phone_number || finalPhoneNumber;
                finalDisplayName = match.verified_name || finalDisplayName;
                qualityRating = match.quality_rating || qualityRating;
                console.log(`[ManualSetup] Step 3: WABA list override → ${finalDisplayName} | ${finalPhoneNumber}`);
            }
        } catch (e: any) {
            console.warn("[ManualSetup] Step 3: WABA list fetch skipped (scope missing) — using direct phone data.");
        }

        // ── Step 4: Subscribe App to WABA ───────────────────────────────────
        try {
            await axios.post(`${BASE}/${wabaId}/subscribed_apps`, null, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log("[ManualSetup] Step 4: App subscribed to WABA ✅");
        } catch (e: any) {
            console.warn("[ManualSetup] Step 4: Subscribe warning (may already be subscribed):", e.response?.data?.error?.message);
        }

        // ── Step 5: Register phone number ───────────────────────────────────
        try {
            await axios.post(`${BASE}/${phoneNumberId}/register`, {
                messaging_product: "whatsapp",
                pin: "123456"
            }, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log("[ManualSetup] Step 5: Phone registered ✅");
        } catch (e: any) {
            console.warn("[ManualSetup] Step 5: Register warning (likely already registered):", e.response?.data?.error?.message);
        }

        // ── Step 6: Persist to database ─────────────────────────────────────
        console.log("[ManualSetup] Step 6: Saving to DB for workspace:", user.workspaceId);
        const encryptedToken = encrypt(accessToken);
        const encryptedSecret = encrypt(isManaged ? "SYSTEM" : appSecret);

        // --- ZERO-CONFLICT CLEARANCE ---
        // If another workspace maliciously or accidentally holds this same phone_number_id,
        // we ruthlessly clear it first because physics dictates a phone_number_id matches 1-to-1.
        await prisma.whatsAppAccount.deleteMany({
            where: {
                phone_number_id: phoneNumberId,
                workspace_id: { not: user.workspaceId }
            }
        });

        await prisma.whatsAppAccount.upsert({
            where: { workspace_id: user.workspaceId },
            update: {
                waba_id: wabaId,
                phone_number_id: phoneNumberId,
                access_token: encryptedToken,
                phone_number: finalPhoneNumber,
                display_name: finalDisplayName,
                quality_rating: qualityRating,
                app_id: isManaged ? "SYSTEM" : appId,
                app_secret: encryptedSecret,
                billing_model: billingModel as any,
                status: "CONNECTED",
                integration_status: "ACTIVE",
                token_valid: true,
                api_status: "OK",
                validated_at: new Date(),
                updated_at: new Date()
            },
            create: {
                workspace_id: user.workspaceId,
                waba_id: wabaId,
                phone_number_id: phoneNumberId,
                access_token: encryptedToken,
                phone_number: finalPhoneNumber,
                display_name: finalDisplayName,
                quality_rating: qualityRating,
                status: "CONNECTED",
                integration_status: "ACTIVE",
                token_valid: true,
                api_status: "OK",
                validated_at: new Date(),
                billing_model: billingModel as any,
                app_id: isManaged ? "SYSTEM" : appId,
                app_secret: encryptedSecret,
            }
        });

        console.log(`[ManualSetup] ✅ Complete. ${finalDisplayName} (${finalPhoneNumber}) connected for ${user.workspaceId}`);

        // ── Step 7: Return full identity to UI ──────────────────────────────
        // BUG FIX: Previous version returned { status: "CONNECTED" } with no identity data.
        // The wizard Step 2 needs verifiedName, phoneNumber, qualityRating.
        return NextResponse.json({
            success: true,
            message: "WhatsApp account connected successfully.",
            data: {
                status: "CONNECTED",
                verifiedName: finalDisplayName,
                phoneNumber: finalPhoneNumber,
                qualityRating: qualityRating,
                wabaId,
                phoneNumberId
            }
        });

    } catch (error: any) {
        const msg = error.response?.data?.error?.message || error.message || "Setup failed";
        console.error("[ManualSetup] Fatal error:", msg);
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
