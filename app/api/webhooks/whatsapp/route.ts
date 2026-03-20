import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { decrypt, encrypt } from "../../../../lib/security/encryption";
import { WhatsAppMediaDownloader } from "../../../../lib/whatsapp/media-downloader";

export const dynamic = "force-dynamic";

// 1. Verification Challenge (GET)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");

        console.log(`[Webhook GET] mode=${mode}, token=${token}, challenge=${challenge}`);

        const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "grafty_verification_token";

        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            console.log("✅ Webhook Verification Successful!");
            return new NextResponse(challenge, { status: 200 });
        }

        console.error(`❌ Verification Failed. Needed: '${VERIFY_TOKEN}', Got: '${token}'`);
        return new NextResponse("Forbidden", { status: 403 });
    } catch (e) {
        console.error("Webhook GET Error:", e);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

// 2. Event Ingestion (POST)
export async function POST(req: Request) {
    const startTime = Date.now();
    let body;

    try {
        const rawBody = await req.text();
        if (!rawBody) return NextResponse.json({ status: "ignored_empty_body" });
        body = JSON.parse(rawBody);
    } catch (err) {
        console.error("Webhook JSON Parsing Error:", err);
        return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    try {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) return NextResponse.json({ status: "ignored_no_value" });

        // ── Handle Inbound Messages ──────────────────────────────────────
        if (value.messages) {
            const message = value.messages[0];
            const contactProfile = value.contacts?.[0];
            const wabaId = value.metadata?.phone_number_id;

            console.log(`[Webhook] ▶️ Message from ${message.from} to WABA ID: "${wabaId}"`);

            // A. Find Workspace by WABA ID (with Auto-Connect Support)
            let waba = await prisma.whatsAppAccount.findUnique({
                where: { phone_number_id: String(wabaId) },
                include: { workspace: true },
            });

            if (!waba) {
                console.log(`⚠️ WABA ${wabaId} not found. Auto-connecting...`);
                let pendingWorkspace = await prisma.workspace.findFirst({ where: { name: "Pending Connections" } });

                if (!pendingWorkspace) {
                    try {
                        pendingWorkspace = await prisma.workspace.create({
                            data: { 
                                name: "Pending Connections", 
                                status: "SUSPENDED",
                                trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                            }
                        });
                    } catch {
                        pendingWorkspace = await prisma.workspace.findFirst();
                    }
                }

                if (pendingWorkspace) {
                    waba = await prisma.whatsAppAccount.create({
                        data: {
                            workspace_id: pendingWorkspace.id,
                            phone_number_id: wabaId,
                            waba_id: entry.id || `unknown_${Date.now()}`,
                            phone_number: value.metadata?.display_phone_number || "Unknown",
                            access_token: "PLACEHOLDER",
                            status: "CONNECTED",
                            integration_status: "ACTIVE"
                        },
                        include: { workspace: true }
                    });
                    console.log(`✅ Auto-Created WABA ${wabaId}`);
                }
            }

            if (!waba) {
                console.error(`CRITICAL: Failed to auto-connect WABA ${wabaId}`);
                return NextResponse.json({ status: "error_no_waba" });
            }

            // B. Upsert Contact
            const phone = message.from;
            const contact = await prisma.contact.upsert({
                where: { workspace_id_phone: { workspace_id: waba.workspace_id, phone } },
                update: { name: contactProfile?.profile?.name || undefined },
                create: { workspace_id: waba.workspace_id, phone, name: contactProfile?.profile?.name || "Unknown" },
            });

            // C. Ensure open conversation exists
            let conversation = await prisma.conversation.findFirst({
                where: { contact_id: contact.id, status: "OPEN" }
            });
            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: { workspace_id: waba.workspace_id, contact_id: contact.id, status: "OPEN" }
                });
            } else {
                await prisma.conversation.update({ where: { id: conversation.id }, data: { updated_at: new Date() } });
            }

            // D. Deduplicate inbound messages
            const metaMessageId = message.id;
            const existing = await prisma.message.findFirst({ where: { meta_id: metaMessageId } });
            if (existing) {
                console.log(`[Webhook] Skipping duplicate: ${metaMessageId}`);
                return NextResponse.json({ status: "skipped_duplicate" });
            }

            // E. Build message content for storage
            let msgContent: any = {};
            let msgType: any = "TEXT";

            if (message.text) {
                const incomingText = message.text.body.trim().toUpperCase();
                const optOutKeywords = waba.opt_out_keywords?.split(',').map(k => k.trim().toUpperCase()) || ["STOP", "CANCEL", "UNSUBSCRIBE"];
                
                if (optOutKeywords.includes(incomingText)) {
                    console.log(`[OPT_OUT] Contact ${phone} requested unsubscribe from Workspace ${waba.workspace_id}`);
                    await prisma.contact.update({
                        where: { id: contact.id },
                        data: { opt_in: false, unsubscribed_at: new Date() }
                    });
                    
                    // Auto-reply with confirmation
                    if (waba.opt_out_reply) {
                        try {
                            const { WhatsAppService } = await import("../../../../lib/whatsapp/service");
                            const token = decrypt(waba.access_token);
                            await WhatsAppService.sendText(waba.phone_number_id, token, phone, waba.opt_out_reply);
                        } catch (e) {
                            console.error("Opt-out confirmation reply failed", e);
                        }
                    }
                }

                msgContent = { body: message.text.body };
                msgType = "TEXT";
            } else if (message.image) {
                const token = decrypt(waba.access_token);
                const localUrl = await WhatsAppMediaDownloader.downloadAndSaveMedia(message.image.id, token, waba.workspace_id);
                msgContent = { media_id: message.image.id, caption: message.image.caption, link: localUrl };
                msgType = "IMAGE";
            } else if (message.document) {
                const token = decrypt(waba.access_token);
                const localUrl = await WhatsAppMediaDownloader.downloadAndSaveMedia(message.document.id, token, waba.workspace_id);
                msgType = "DOCUMENT";
                msgContent = { media_id: message.document.id, filename: message.document.filename, link: localUrl };
            } else if (message.audio) {
                const token = decrypt(waba.access_token);
                const localUrl = await WhatsAppMediaDownloader.downloadAndSaveMedia(message.audio.id, token, waba.workspace_id);
                msgType = "AUDIO";
                msgContent = { media_id: message.audio.id, link: localUrl };
            } else if (message.video) {
                const token = decrypt(waba.access_token);
                const localUrl = await WhatsAppMediaDownloader.downloadAndSaveMedia(message.video.id, token, waba.workspace_id);
                msgType = "VIDEO";
                msgContent = { media_id: message.video.id, link: localUrl };
            } else if (message.interactive) {
                msgType = "INTERACTIVE";
                msgContent = message.interactive;
            } else if (message.button) {
                msgType = "INTERACTIVE";
                msgContent = { button_text: message.button.text, button_payload: message.button.payload };
            } else if (message.order) {
                msgType = "ORDER";
                msgContent = {
                    catalog_id: message.order.catalog_id,
                    text: message.order.text,
                    product_items: message.order.product_items
                };
                try {
                    const { CommerceService } = await import("../../../../lib/services/commerce-service");
                    await CommerceService.processWhatsAppOrder(waba.workspace_id, contact.id, msgContent);
                } catch (err) {
                    console.error("Order process error", err);
                }
            } else {
                msgContent = { raw: message };
                msgType = "UNKNOWN";
            }

            // F. Save inbound message
            await prisma.message.create({
                data: {
                    workspace_id: waba.workspace_id,
                    contact_id: contact.id,
                    conversation_id: conversation.id,
                    meta_id: metaMessageId,
                    type: msgType,
                    direction: "INBOUND",
                    content: msgContent,
                    status: "DELIVERED"
                }
            });
            console.log(`✅ Inbound message saved: ${metaMessageId}`);

            // G. 🔥 Enterprise Flow Engine — NON-BLOCKING
            try {
                const { normalizeMessage } = await import("../../../../lib/engine/message-normalizer");
                const { FlowRunner } = await import("../../../../lib/engine/flow-runner");
                const normalizedMsg = normalizeMessage(message, value);

                console.log(`[Webhook] 🔥 FlowEngine: type=${normalizedMsg.type} value="${normalizedMsg.value}"`);

                FlowRunner.processMessage(waba.workspace_id, contact.id, normalizedMsg)
                    .then(() => console.log(`[Webhook] ✅ FlowEngine done in ${Date.now() - startTime}ms`))
                    .catch(e => console.error("[Webhook] FlowEngine error:", e));
            } catch (flowError) {
                console.error("Flow Trigger Error:", flowError);
            }
        }

        // ── Handle Account Update (Hosted Embedded Signup) ─────────────
        if (changes?.field === "account_update" && value?.event === "PARTNER_ADDED") {
            const partnerWabaId = value.waba_id;
            const businessPortfolioId = value.business_portfolio_id;
            const phoneId = value.phone_number_id;

            console.log(`[Webhook] 🚀 PARTNER_ADDED Event for WABA: ${partnerWabaId}`);

            // 1. Fetch System Config to get System Token & App Secret
            const { SystemConfigService } = await import("../../../../lib/services/system-config-service");
            const secrets = await SystemConfigService.getDecryptedSecrets();

            if (!secrets.meta_app_secret || !secrets.meta_system_token) {
                console.error("Missing Super Admin Meta Secrets for Token Exchange.");
                return NextResponse.json({ status: "error_missing_secrets" });
            }

            // 2. Generate HMAC-SHA256 App Secret Proof
            const crypto = await import("crypto");
            const appSecretProof = crypto
                .createHmac("sha256", secrets.meta_app_secret)
                .update(secrets.meta_system_token)
                .digest("hex");

            try {
                const axios = (await import("axios")).default;

                // 3. Exchange for Business Token
                const tokenResponse = await axios.post(`https://graph.facebook.com/v20.0/${businessPortfolioId}/system_user_access_tokens`, null, {
                    params: {
                        appsecret_proof: appSecretProof,
                        fetch_only: true
                    },
                    headers: {
                        Authorization: `Bearer ${secrets.meta_system_token}`
                    }
                });

                const businessToken = tokenResponse.data.access_token;

                if (!businessToken) throw new Error("No token returned from Meta.");

                // 4. Fetch Phone Number Details to get Display Name & actual Phone
                const phoneRes = await axios.get(`https://graph.facebook.com/v20.0/${partnerWabaId}/phone_numbers`, {
                    params: { access_token: businessToken }
                });

                const phoneData = phoneRes.data.data?.find((p: any) => p.id === phoneId) || phoneRes.data.data?.[0];
                const displayPhone = phoneData?.display_phone_number || "Unknown";
                const displayName = phoneData?.verified_name || "WhatsApp Business";

                console.log(`Successfully acquired token for ${displayPhone} (${phoneId})`);

                // 5. Store in Database
                // Note: Since the webhook doesn't inherently contain the Workspace ID,
                // we place it in a PENDING state or auto-match if we passed state via a custom mechanism.
                // For now, we will create it under the 'Pending Connections' workspace.
                // The frontend will "claim" this account in the UI.

                let pendingWorkspace = await prisma.workspace.findFirst({ where: { name: "Pending Connections" } });
                if (!pendingWorkspace) {
                    pendingWorkspace = await prisma.workspace.create({
                        data: { 
                            name: "Pending Connections", 
                            status: "SUSPENDED",
                            trial_ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        }
                    });
                }

                await prisma.whatsAppAccount.upsert({
                    where: { phone_number_id: phoneId },
                    update: {
                        access_token: encrypt(businessToken),
                        waba_id: partnerWabaId,
                        phone_number: displayPhone,
                        display_name: displayName,
                        business_id: businessPortfolioId,
                        integration_status: "ACTIVE",
                        status: "CONNECTED"
                    },
                    create: {
                        workspace_id: pendingWorkspace.id,
                        phone_number_id: phoneId,
                        access_token: encrypt(businessToken),
                        waba_id: partnerWabaId,
                        phone_number: displayPhone,
                        display_name: displayName,
                        business_id: businessPortfolioId,
                        integration_status: "ACTIVE",
                        status: "CONNECTED"
                    }
                });

                console.log(`[Webhook] ✅ Successfully Provisioned WABA ${partnerWabaId}`);
            } catch (exchangeError: any) {
                console.error("[Webhook] Token Exchange Failed:", exchangeError.response?.data || exchangeError.message);
            }
        }

        // ── Handle Message Status Updates ──────────────────────────────
        if (value.statuses) {
            for (const statusUpdate of value.statuses) {
                const messageMetaId = statusUpdate.id;
                const statusStr = statusUpdate.status.toUpperCase();
                const timestamp = statusUpdate.timestamp ? new Date(parseInt(statusUpdate.timestamp) * 1000) : new Date();

                let updateData: any = {};
                if (statusStr === "FAILED" && statusUpdate.errors?.length > 0) {
                    const err = statusUpdate.errors[0];
                    let errMsg = err.title || err.message || "Unknown error";
                    if (err.code === 131026) errMsg = "Invalid Phone Number";
                    else if (err.code === 131048) errMsg = "User blocked your number";
                    else if (err.code === 131056) errMsg = "Rate limit exceeded";
                    else if (err.code === 131047) errMsg = "More than 24 hours passed";
                    updateData = { error_code: `${err.code}`, error_message: errMsg, failed_at: timestamp };
                }

                if (statusStr === "SENT") updateData.sent_at = timestamp;
                if (statusStr === "DELIVERED") updateData.delivered_at = timestamp;
                if (statusStr === "READ") updateData.read_at = timestamp;

                try {
                    await prisma.message.update({
                        where: { meta_id: messageMetaId },
                        data: { status: statusStr, ...updateData }
                    });
                } catch {
                    // Not in DB — ignore
                }
            }
        }

        return NextResponse.json({ status: "processed" });

    } catch (error: any) {
        console.error("Webhook Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
