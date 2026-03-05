import axios from "axios";

const META_API_VERSION = "v18.0";
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
        payload: any
    ) {
        // Sanitization: Ensure phone number is digits only
        const sanitizedTo = payload.to.replace(/\D/g, "");
        payload.to = sanitizedTo;

        if (token.startsWith("MOCK_") || token === "test_token") {
            console.log(`[WA_MOCK] Sending ${payload.type} to ${payload.to}`);
            return {
                messaging_product: "whatsapp",
                contacts: [{ input: payload.to, wa_id: payload.to }],
                messages: [{ id: "wamid.MOCK_" + Date.now() + Math.random() }]
            };
        }

        try {
            const url = `${BASE_URL}/${phoneId}/messages`;
            console.log(`[WA_API_SEND] Sending ${payload.type} to ${payload.to}...`);

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

            console.log(`[WA_API_SUCCESS] Meta ID: ${response.data.messages?.[0]?.id}`);
            return response.data;
        } catch (error: any) {
            console.error("WhatsApp API Error:", error.response?.data || error.message);
            console.error("Failed Payload:", JSON.stringify(payload, null, 2));
            throw error;
        }
    }

    static async sendText(phoneId: string, token: string, to: string, body: string) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "text",
            text: { body }
        });
    }

    static async sendTemplate(
        phoneId: string,
        token: string,
        to: string,
        templateName: string,
        langCode: string = "en",
        components: any[] = []
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "template",
            template: {
                name: templateName,
                language: { code: langCode },
                components
            }
        });
    }

    static async sendImage(phoneId: string, token: string, to: string, url: string, caption?: string) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "image",
            image: {
                link: url,
                caption
            }
        });
    }

    static async sendDocument(phoneId: string, token: string, to: string, url: string, filename?: string) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "document",
            document: {
                link: url,
                filename
            }
        });
    }

    static async sendVideo(phoneId: string, token: string, to: string, url: string, caption?: string) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "video",
            video: {
                link: url,
                caption
            }
        });
    }

    static async sendVoice(phoneId: string, token: string, to: string, url: string) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "audio",
            audio: {
                link: url
            }
        });
    }

    static async sendInteractiveButtons(
        phoneId: string,
        token: string,
        to: string,
        body: string,
        buttons: { id: string, title: string }[],
        header?: { type: "image" | "video" | "document", link: string }
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

        return this.sendMessage(phoneId, token, payload);
    }

    static async sendURLButton(
        phoneId: string,
        token: string,
        to: string,
        body: string,
        title: string,
        url: string,
        header?: { type: "image" | "video" | "document", link: string }
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

        return this.sendMessage(phoneId, token, payload);
    }

    static async sendPhoneButton(
        phoneId: string,
        token: string,
        to: string,
        body: string,
        title: string,
        phone: string
    ) {
        // Standard Cloud API doesn't support interactive phone buttons without templates.
        // We send a beautifully formatted text message with a professional-looking link.
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        const message = `${body}\n\n📞 *${title}*\n+${cleanPhone}`;

        return this.sendText(phoneId, token, to, message);
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
        flowToken: string = "token_123"
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
        });
    }

    static async sendCarousel(
        phoneId: string,
        token: string,
        to: string,
        cards: { image_url: string, title: string, description: string, buttons: { id: string, text: string }[] }[]
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
        });
    }

    static async sendListMessage(
        phoneId: string,
        token: string,
        to: string,
        body: string,
        buttonText: string,
        sections: { title: string, rows: { id: string, title: string, description?: string }[] }[],
        header?: { type: "text" | "image" | "video" | "document", text?: string, link?: string },
        footer?: string
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

        return this.sendMessage(phoneId, token, payload);
    }

    static async sendMultiProductMessage(
        phoneId: string,
        token: string,
        to: string,
        catalogId: string,
        bodyText: string,
        sections: { title: string, product_retailer_ids: string[] }[]
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
        });
    }

    static async validateCredentials(phoneNumberId: string, accessToken: string) {
        if (accessToken === "test_token" || accessToken.startsWith("MOCK_") || process.env.NODE_ENV === "development") {
            return {
                success: true,
                data: {
                    phoneNumber: "919999999999",
                    verifiedName: "Test Account",
                    qualityRating: "GREEN"
                }
            };
        }

        try {
            const url = `${BASE_URL}/${phoneNumberId}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.data && response.data.id === phoneNumberId) {
                return {
                    success: true,
                    data: {
                        phoneNumber: response.data.display_phone_number,
                        verifiedName: response.data.verified_name,
                        qualityRating: response.data.quality_rating
                    }
                };
            }
            return { success: false, error: "Phone ID mismatch or invalid token" };
        } catch (error: any) {
            console.error("Meta Validation Error:", error.response?.data || error.message);
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message || "Validation failed"
            };
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
     * Revoke (Delete for everyone) a message
     * Requires v21.0+ or specific permissions
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
}
