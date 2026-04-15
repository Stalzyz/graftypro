import axios from "axios";
import { normalizePhone } from "../utils/phone";

const META_API_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface SendMessagePayload {
    to: string;
    type: "text" | "template" | "image" | "interactive" | "document" | "video" | "audio";
    text?: { body: string };
    image?: { link: string; caption?: string };
    document?: { link: string; filename?: string };
    video?: { link: string; caption?: string };
    audio?: { link: string };
    template?: {
        name: string;
        language: { code: string };
        components?: any[];
    };
    interactive?: any;
}

export class WhatsAppService {

    /**
     * Send a message via Meta Cloud API
     */
    static async sendMessage(
        phoneId: string,
        token: string,
        payload: any,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        // Sanitization: Ensure phone number is digits only
        const sanitizedTo = normalizePhone(payload.to);
        payload.to = sanitizedTo;

        if (token.startsWith("MOCK_") || token === "test_token") {
            console.log(`[WA_MOCK] Sending ${payload.type} to ${payload.to}`);
            return {
                messaging_product: "whatsapp",
                contacts: [{ input: payload.to, wa_id: payload.to }],
                messages: [{ id: "wamid.MOCK_" + Date.now() + Math.random() }]
            };
        }

        let transactionId: string | null = null;

        // ----------------------------------------------------
        // CREDIT ENGINE: Pre-Flight Deduction
        // ----------------------------------------------------
        if (workspaceId && category) {
            try {
                const { CreditService } = await import('@/lib/credits/service');
                const { v4: uuidv4 } = require('uuid');
                
                // Naive Country Code Extraction (Assumes non-India numbers include full code)
                let countryCode = "91";
                if (sanitizedTo.startsWith("1")) countryCode = "1";
                else if (sanitizedTo.startsWith("44")) countryCode = "44";
                else if (sanitizedTo.length > 10) countryCode = sanitizedTo.substring(0, sanitizedTo.length - 10);

                const currentCost = await CreditService.getMessageCost(category, countryCode, workspaceId);
                const localMessageId = `int_${uuidv4()}`;

                const deduction = await CreditService.deductCreditsAtomic(
                    workspaceId,
                    currentCost,
                    localMessageId,
                    null, // Meta Message ID updated post-flight
                    category,
                    countryCode,
                    description || `WhatsApp ${category} Message`
                );

                if (deduction.success) {
                    transactionId = deduction.transaction_id;
                }
            } catch (err: any) {
                console.error("[WhatsAppService] Credit Engine Blocked Message:", err.message);
                
                // Construct a standardized error response for the frontend / API
                const error = new Error(`BILLING_ERROR: ${err.message}`);
                (error as any).response = { data: { error: { message: err.message, type: "BillingException" } } };
                throw error;
            }
        }

        // ----------------------------------------------------
        // OUTBOUND TRANSMISSION
        // ----------------------------------------------------
        try {
            const { maskToken } = await import('@/lib/security/encryption');
            const url = `${BASE_URL}/${phoneId}/messages`;
            console.log(`[WA_API_SEND] Sending ${payload.type} to ${payload.to} (Token: ${maskToken(token)})`);
            // Removing raw payload log for production privacy
            // console.log(`[WA_API_PAYLOAD]`, JSON.stringify(payload, null, 2)); 

            const response = await axios.post(url, {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                ...payload
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            const metaMessageId = response.data.messages?.[0]?.id;
            console.log(`[WA_API_SUCCESS] Meta ID: ${metaMessageId}`);

            // ----------------------------------------------------
            // CREDIT ENGINE: Post-Flight Reconciliation
            // ----------------------------------------------------
            if (transactionId && metaMessageId) {
                const { CreditService } = await import('@/lib/credits/service');
                await CreditService.updateMetaMessageId(transactionId, metaMessageId).catch(e => {
                    console.error("[WhatsAppService] Failed to sync Meta ID to ledger:", e.message);
                });
            }

            return response.data;
        } catch (error: any) {
            console.error("WhatsApp API Error:", error.response?.data || error.message);
            console.error("Failed Payload:", JSON.stringify(payload, null, 2));

            // Optional: If transmission failed but credit was deducted, we could trigger an auto-refund here.
            // For MVP, we maintain the ledger integrity and manual adjustments can be made.
            
            throw error;
        }
    }

    static async sendText(
        phoneId: string, 
        token: string, 
        to: string, 
        body: string,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "text",
            text: { body }
        }, workspaceId, category, description);
    }

    static async sendTemplate(
        phoneId: string,
        token: string,
        to: string,
        templateName: string,
        langCode: string = "en",
        components: any[] = [],
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "template",
            template: {
                name: templateName,
                language: { code: langCode },
                components
            }
        }, workspaceId, category, description);
    }

    static async sendImage(
        phoneId: string, 
        token: string, 
        to: string, 
        url: string, 
        caption?: string,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "image",
            image: {
                link: url,
                caption
            }
        }, workspaceId, category, description);
    }

    static async sendDocument(
        phoneId: string, 
        token: string, 
        to: string, 
        url: string, 
        filename?: string,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "document",
            document: {
                link: url,
                filename
            }
        }, workspaceId, category, description);
    }

    static async sendVideo(
        phoneId: string, 
        token: string, 
        to: string, 
        url: string, 
        caption?: string,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "video",
            video: {
                link: url,
                caption
            }
        }, workspaceId, category, description);
    }

    static async sendVoice(
        phoneId: string, 
        token: string, 
        to: string, 
        url: string,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "audio",
            audio: {
                link: url
            }
        }, workspaceId, category, description);
    }

    static async sendInteractiveButtons(
        phoneId: string,
        token: string,
        to: string,
        body: string,
        buttons: { id: string, title: string }[],
        header?: { type: "image" | "video" | "document", link: string },
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        const payload: any = {
            to,
            type: "interactive",
            interactive: {
                type: "button",
                body: { text: body },
                action: {
                    buttons: buttons.map(btn => ({
                        type: "reply",
                        reply: { id: btn.id, title: btn.title }
                    }))
                }
            }
        };

        if (header) {
            payload.interactive.header = {
                type: header.type,
                [header.type]: { link: header.link }
            };
        }

        return this.sendMessage(phoneId, token, payload, workspaceId, category, description);
    }

    static async sendURLButton(
        phoneId: string,
        token: string,
        to: string,
        body: string,
        title: string,
        url: string,
        header?: { type: "image" | "video" | "document", link: string },
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        // Ensure URL is absolute for Meta
        const finalUrl = url.startsWith('http') ? url : `https://${url}`;

        const payload: any = {
            to,
            type: "interactive",
            interactive: {
                type: "cta_url",
                body: { text: body },
                action: {
                    name: "cta_url",
                    parameters: {
                        display_text: title,
                        url: finalUrl
                    }
                }
            }
        };

        if (header) {
            payload.interactive.header = {
                type: header.type,
                [header.type]: { link: header.link }
            };
        }

        return this.sendMessage(phoneId, token, payload, workspaceId, category, description);
    }

    static async sendPhoneButton(
        phoneId: string,
        token: string,
        to: string,
        body: string,
        title: string,
        phone: string,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        // Standard Cloud API doesn't support interactive phone buttons without templates.
        // We send a beautifully formatted text message with a professional-looking link.
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const message = `${body}\n\n📞 *${title}*\n+${cleanPhone}`;

        return this.sendText(phoneId, token, to, message, workspaceId, category, description);
    }

    static async sendMetaFlow(
        phoneId: string,
        token: string,
        to: string,
        flowId: string,
        ctaText: string,
        header: string,
        body: string,
        footer: string,
        flowToken: string = "token_123",
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "interactive",
            interactive: {
                type: "flow",
                header: { type: "text", text: header },
                body: { text: body },
                footer: { text: footer },
                action: {
                    name: "flow",
                    parameters: {
                        flow_message_version: "3",
                        flow_token: flowToken,
                        flow_id: flowId,
                        flow_cta: ctaText,
                        flow_action: "navigate",
                        flow_action_payload: { screen: "QUESTION_1" }
                    }
                }
            }
        }, workspaceId, category, description);
    }

    static async sendCarousel(
        phoneId: string,
        token: string,
        to: string,
        cards: { image_url: string, title: string, description: string, buttons: { id: string, text: string }[] }[],
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        const limitedCards = cards.slice(0, 10);

        return this.sendMessage(phoneId, token, {
            to,
            type: "interactive",
            interactive: {
                type: "carousel",
                body: { text: "Swipe to view items" },
                action: {
                    cards: limitedCards.map(card => ({
                        header: {
                            type: "image",
                            image: { link: card.image_url }
                        },
                        body: { text: `*${card.title}*\n${card.description}` },
                        buttons: card.buttons.map(btn => ({
                            type: "reply",
                            reply: { id: btn.id, title: btn.text }
                        }))
                    }))
                }
            }
        }, workspaceId, category, description);
    }

    static async sendListMessage(
        phoneId: string,
        token: string,
        to: string,
        body: string,
        buttonText: string,
        sections: { title: string, rows: { id: string, title: string, description?: string }[] }[],
        header?: { type: "text" | "image" | "video" | "document", text?: string, link?: string },
        footer?: string,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        const payload: any = {
            to,
            type: "interactive",
            interactive: {
                type: "list",
                body: { text: body },
                action: {
                    button: buttonText,
                    sections: sections
                }
            }
        };

        if (header) {
            if (header.type === "text") {
                payload.interactive.header = { type: "text", text: header.text };
            } else {
                payload.interactive.header = {
                    type: header.type,
                    [header.type]: { link: header.link }
                };
            }
        }

        if (footer) {
            payload.interactive.footer = { text: footer };
        }

        return this.sendMessage(phoneId, token, payload, workspaceId, category, description);
    }

    static async sendMultiProductMessage(
        phoneId: string,
        token: string,
        to: string,
        catalogId: string,
        bodyText: string,
        sections: { title: string, product_retailer_ids: string[] }[],
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "interactive",
            interactive: {
                type: "product_list",
                header: { type: "text", text: "Store Catalog" },
                body: { text: bodyText },
                footer: { text: "Tap to view items" },
                action: {
                    catalog_id: catalogId,
                    sections: sections.map(s => ({
                        title: s.title,
                        product_items: s.product_retailer_ids.map(id => ({ product_retailer_id: id }))
                    }))
                }
            }
        }, workspaceId, category, description);
    }

    static async sendSingleProduct(
        phoneId: string,
        token: string,
        to: string,
        catalogId: string,
        productRetailerId: string,
        bodyText: string,
        footerText?: string,
        workspaceId?: string,
        category?: string,
        description?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "interactive",
            interactive: {
                type: "product",
                body: { text: bodyText },
                ...(footerText ? { footer: { text: footerText } } : {}),
                action: {
                    catalog_id: catalogId,
                    product_retailer_id: productRetailerId
                }
            }
        }, workspaceId, category, description);
    }

    /**
     * Validate WhatsApp credentials against Meta Graph API.
     * 
     * EXPERT NOTE (Meta Cloud API v20.0+):
     * - GET /{PHONE_ID}?fields=verified_name → ERROR #100 (wrong node for this field)
     * - GET /{WABA_ID}/phone_numbers?fields=verified_name → ERROR #100 (explicit fields cause permission check)
     * - GET /{WABA_ID}/phone_numbers (NO ?fields) → SUCCESS — returns display_phone_number, verified_name,
     *   quality_rating as DEFAULT fields without triggering the management permission check.
     * 
     * This is the ONLY correct pattern per Meta's official documentation.
     */
    static async validateCredentials(phoneNumberId: string, accessToken: string, wabaId?: string) {
        if (accessToken === "test_token" || accessToken.startsWith("MOCK_")) {
            return {
                success: true,
                data: { phoneNumber: "+1 234-567-8900", verifiedName: "Test Account", qualityRating: "GREEN" }
            };
        }

        try {
            // STEP 1: Verify the phone node is accessible (proves token has messaging scope)
            // This endpoint returns {id, ...} by default — always safe.
            const phoneNodeRes = await axios.get(`${BASE_URL}/${phoneNumberId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!phoneNodeRes.data?.id) {
                return { success: false, error: "Phone Number ID not found on Meta. Verify it is correct." };
            }

            // STEP 2: If WABA ID is provided, get phone metadata from the WABA node.
            // CRITICAL: Do NOT add ?fields=... here. Meta returns default fields
            // (display_phone_number, verified_name, quality_rating) without permission errors.
            if (wabaId) {
                try {
                    const wabaRes = await axios.get(`${BASE_URL}/${wabaId}/phone_numbers`, {
                        headers: { Authorization: `Bearer ${accessToken}` }
                    });

                    const phones: any[] = wabaRes.data?.data || [];
                    const match = phones.find(p => p.id?.toString() === phoneNumberId.toString());

                    if (match) {
                        return {
                            success: true,
                            data: {
                                phoneNumber: match.display_phone_number || phoneNumberId,
                                verifiedName: match.verified_name || "WhatsApp Business",
                                qualityRating: match.quality_rating || "GREEN"
                            }
                        };
                    }
                } catch (wabaErr: any) {
                    // WABA query failed (token may not have WABA access) — fall through to safe fallback
                    console.warn("[WA Validate] WABA phone list query failed:", wabaErr.response?.data?.error?.message || wabaErr.message);
                }
            }

            // STEP 3: Safe fallback — token is valid (Step 1 passed), return empty phone/name.
            // The route layer will substitute the user-entered values.
            return {
                success: true,
                data: { phoneNumber: "", verifiedName: "", qualityRating: "GREEN" }
            };

        } catch (error: any) {
            const errMsg = error.response?.data?.error?.message || error.message || "Credential verification failed";
            console.error("[WA Validate] Meta Error:", errMsg);
            return { success: false, error: errMsg };
        }
    }

    /**
     * Get Media Details from Meta
     */
    static async getMediaDetails(mediaId: string, token: string) {
        const url = `${BASE_URL}/${mediaId}`;
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data; // contains .url, .mime_type, .file_size, .id
    }

    /**
     * Download Binary from Meta URL
     */
    static async downloadMediaBinary(url: string, token: string) {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'arraybuffer'
        });
        return {
            buffer: Buffer.from(response.data),
            contentType: response.headers['content-type']
        };
    }

    /**
     * Programmatically subscribe our Meta App to a Vendor's WABA events.
     * This is the MAGIC step that starts the message flow without visiting the Meta Dashboard.
     */
    static async subscribeToWebhooks(wabaId: string, accessToken: string) {
        try {
            console.log(`[WA_SUBSCRIBE] Activating Webhook Stream for WABA: ${wabaId}...`);
            const url = `${BASE_URL}/${wabaId}/subscribed_apps`;
            const response = await axios.post(url, {}, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            console.log(`[WA_SUBSCRIBE] SUCCESS:`, response.data);
            return { success: true, data: response.data };
        } catch (error: any) {
            console.error("[WA_SUBSCRIBE] FAILED:", error.response?.data || error.message);
            return { success: false, error: error.response?.data?.error?.message || error.message };
        }
    }

    /**
     * Revoke (Delete for everyone) a message
     */
    static async revokeMessage(phoneId: string, token: string, messageId: string) {
        try {
            // Meta Cloud API v21.0+ Delete Endpoint
            const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
            const response = await axios.post(url, {
                status: "deleted",
                message_id: messageId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error: any) {
            console.error("[WhatsAppService] Revoke Error:", error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Nuclear Fix: Proactively upload media to Meta to get a media_id using a raw buffer.
     * Bypasses URL-fetching issues by accepting direct binary data.
     */
    static async uploadMediaFromBuffer(buffer: Buffer, contentType: string, fileName: string, phoneId: string, accessToken: string): Promise<string | null> {
        try {
            // WHATSAPP API SPEC: Supported values are: audio, document, image, video.
            // Using full MIME types in this field is a common source of 131053.
            let mediaType = 'document'; // default fallback
            if (contentType.startsWith('image/')) mediaType = 'image';
            else if (contentType.startsWith('video/')) mediaType = 'video';
            else if (contentType.startsWith('audio/')) mediaType = 'audio';

            console.log(`[WA_MEDIA_SYNC] 🚀 Binary Upload: ${fileName} | Meta-Type: ${mediaType} | Buffer-Type: ${contentType}`);
            
            const formData = new FormData();
            
            // 🎯 CRITICAL: Meta's multipart parser is sensitive to field order.
            // 'messaging_product' should ALWAYS be the first field.
            formData.append('messaging_product', 'whatsapp');
            
            const blob = new Blob([new Uint8Array(buffer)], { type: contentType });
            // Add the file blob with the original filename
            formData.append('file', blob, fileName);
            
            // Add the category type
            formData.append('type', mediaType);

            const uploadUrl = `https://graph.facebook.com/v21.0/${phoneId}/media`;
            const response = await fetch(uploadUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            const data = await response.json() as any;

            if (data && data.id) {
                console.log(`[WA_MEDIA_SYNC] ✅ SUCCESS: media_id=${data.id}`);
                return data.id as string;
            }

            // SPEC COMPLIANT LOGGING: Capture error_subcode and details
            console.error("[WA_MEDIA_SYNC] ❌ Meta Rejection Detail:", {
                status: response.status,
                error: data.error?.message || "Unknown error",
                code: data.error?.code,
                subcode: data.error?.error_subcode,
                details: data.error?.error_data?.details
            });
            return null;
        } catch (error: any) {
            console.error("[WA_MEDIA_SYNC] ❌ Meta Upload Crash:", error.message);
            return null;
        }
    }

    /**
     * WhatsApp Media Sync: Downloads from a URL then uploads to Meta.
     */
    static async uploadMediaFromUrl(url: string, phoneId: string, accessToken: string): Promise<string | null> {
        try {
            console.log(`[WA_MEDIA_SYNC] Syncing from URL: ${url}`);
            const download = await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 });
            const buffer = Buffer.from(download.data);
            const contentType = download.headers['content-type'] || 'application/octet-stream';
            
            // Infer extension from content type if possible
            let ext = '.bin';
            if (contentType.includes('pdf')) ext = '.pdf';
            else if (contentType.includes('image')) ext = '.jpg';
            else if (contentType.includes('video')) ext = '.mp4';
            else if (contentType.includes('audio')) ext = '.mp3';

            return await this.uploadMediaFromBuffer(buffer, contentType, `sync_file${ext}`, phoneId, accessToken);
        } catch (error: any) {
            console.error("[WA_MEDIA_SYNC] Step 1 (Download) Failed:", error.message);
            return null;
        }
    }
}

