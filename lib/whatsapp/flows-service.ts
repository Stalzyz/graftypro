import axios from 'axios';
import { prisma } from '../db';
import { decrypt } from '../security/encryption';

const META_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${META_VERSION}`;

/**
 * 🛰️ GRAFTY META FLOW SERVICE
 * Handles absolute lifecycle of Interactive WhatsApp Flows.
 * [Monster Level: Atomic Errors & Spec Validation]
 */
export class MetaFlowService {

    /**
     * 🏗️ CREATE NEW FLOW ON META
     */
    static async createFlow(workspaceId: string, name: string) {
        const account = await this.getAccount(workspaceId);
        const token = decrypt(account.access_token);

        try {
            const res = await axios.post(`${BASE_URL}/${account.waba_id}/flows`, {
                name,
                categories: ["LEAD_GENERATION", "OTHER"]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.data?.id) throw new Error("Meta failed to return Flow ID");

            return res.data.id;
        } catch (error: any) {
            const msg = error.response?.data?.error?.message || error.message;
            throw new Error(`[FlowCreate] ${msg}`);
        }
    }

    /**
     * 📝 UPLOAD SPEC (SCREEN DEFINITION)
     */
    static async updateSpec(workspaceId: string, flowId: string, spec: any) {
        const account = await this.getAccount(workspaceId);
        const token = decrypt(account.access_token);

        try {
            // Meta expects spec as a form-data file
            const formData = new FormData();
            formData.append("name", "flow.json");
            formData.append("asset_type", "FLOW_JSON");
            
            // Convert JSON object to a File/Blob equivalent for upload
            const jsonString = typeof spec === 'string' ? spec : JSON.stringify(spec);
            const blob = new Blob([jsonString], { type: 'application/json' });
            formData.append("file", blob, "flow.json");

            const res = await axios.post(`${BASE_URL}/${flowId}/assets`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    // Axios will automatically set the correct Content-Type for FormData
                }
            });

            return res.data;
        } catch (error: any) {
            const msg = error.response?.data?.error?.message || error.message;
            throw new Error(`[FlowSpec] ${msg}`);
        }
    }

    /**
     * 🚀 PUBLISH FLOW (GO LIVE)
     */
    static async publishFlow(workspaceId: string, flowId: string) {
        const account = await this.getAccount(workspaceId);
        const token = decrypt(account.access_token);

        try {
            await axios.post(`${BASE_URL}/${flowId}/publish`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });

            await prisma.flow.update({
                where: { meta_flow_id: flowId },
                data: { meta_flow_status: "PUBLISHED" }
            });
        } catch (error: any) {
            const msg = error.response?.data?.error?.message || error.message;
            throw new Error(`[FlowPublish] ${msg}`);
        }
    }

    /**
     * 📊 SYNC ALL FLOWS FROM META
     */
    static async syncFlows(workspaceId: string) {
        const account = await this.getAccount(workspaceId);
        const token = decrypt(account.access_token);

        try {
            const res = await axios.get(`${BASE_URL}/${account.waba_id}/flows`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data?.data || [];
        } catch (error: any) {
            console.error("[FlowSync] Error:", error.message);
            return [];
        }
    }

    private static async getAccount(workspaceId: string) {
        const account = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: workspaceId }
        });
        if (!account) throw new Error("WABA Account not found");
        return account;
    }
}
