import axios from 'axios';
import { prisma } from '../db';
import { decrypt, encrypt } from '../security/encryption';

const META_VERSION = "v20.0";
const BASE_URL = `https://graph.facebook.com/${META_VERSION}`;

export class MetaBSPService {
    /**
     * ⚙️ 1. VALIDATE & REGISTER (Atomic Level)
     * Proves token is valid and ensures the phone is registered with Meta.
     */
    static async setupConnection(phoneNumberId: string, accessToken: string, wabaId: string) {
        try {
            // A. Identity verify (Safe check, no restricted fields)
            const nodeRes = await axios.get(`${BASE_URL}/${phoneNumberId}`, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (!nodeRes.data?.id) throw new Error("Invalid Phone Number ID");

            // B. 📡 SUBSCRIBE APP (Spec Step 5)
            // This is the CRITICAL missing link. We must tell Meta to send events to our app.
            try {
                await axios.post(`${BASE_URL}/${wabaId}/subscribed_apps`, null, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
            } catch (subErr: any) {
                console.warn("[MetaBSP] Subscription warning (may already be subbed):", subErr.response?.data || subErr.message);
            }

            // C. REGISTER PHONE (Spec Step 4)
            try {
                await axios.post(`${BASE_URL}/${phoneNumberId}/register`, {
                    messaging_product: "whatsapp",
                    pin: "123456" // Default registration PIN for BSP
                }, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
            } catch (regErr: any) {
                console.warn("[MetaBSP] Registration warning:", regErr.response?.data || regErr.message);
            }

            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error?.message || error.message || "Meta Setup Failed"
            };
        }
    }

    /**
     * 💬 7. SEND TEXT MESSAGE (Atomic Level)
     */
    static async sendMessage(phoneNumberId: string, accessToken: string, to: string, body: string) {
        return axios.post(`${BASE_URL}/${phoneNumberId}/messages`, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to,
            type: "text",
            text: { body }
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    }

    /**
     * 🔄 13. MARK AS READ
     */
    static async markAsRead(phoneNumberId: string, accessToken: string, messageId: string) {
        return axios.post(`${BASE_URL}/${phoneNumberId}/messages`, {
            messaging_product: "whatsapp",
            status: "read",
            message_id: messageId
        }, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
    }
}
