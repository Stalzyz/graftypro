import axios from "axios";

const META_API_VERSION = "v18.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface SendMessagePayload {
    to: string;
    type: "text" | "template" | "image" | "interactive";
    text?: { body: string };
    image?: { link: string; caption?: string };
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
        phoneNumberId: string,
        accessToken: string,
        payload: SendMessagePayload
    ) {
        try {
            const url = `${BASE_URL}/${phoneNumberId}/messages`;

            const response = await axios.post(url, {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                ...payload
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            return response.data;
        } catch (error: any) {
            console.error("Meta API Error:", error.response?.data || error.message);
            // Don't throw to avoid crashing flow runner
            return null;
        }
    }

    static async sendText(
        phoneId: string,
        token: string,
        to: string,
        body: string
    ) {
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

    static async sendImage(
        phoneId: string,
        token: string,
        to: string,
        url: string,
        caption?: string
    ) {
        return this.sendMessage(phoneId, token, {
            to,
            type: "image",
            image: {
                link: url,
                caption
            }
        });
    }
}
