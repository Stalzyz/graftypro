import axios from 'axios';
import { prisma } from '../db';
import { decrypt } from '../security/encryption';

const META_VERSION = "v21.0";
const BASE_URL = `https://graph.facebook.com/${META_VERSION}`;

/**
 * 🛰️ GRAFTY META FLOW SERVICE
 * Handles absolute lifecycle of Interactive WhatsApp Flows.
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
                categories: ["LEAD_GENERATION"]
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.data?.id) throw new Error("Meta failed to return Flow ID");

            return res.data.id;
        } catch (error: any) {
            const metaError = error.response?.data?.error;
            const msg = metaError?.message || error.message;
            const details = metaError?.error_user_msg || JSON.stringify(metaError || {});
            console.error(`[FlowCreate] Failed:`, details);
            throw new Error(`[FlowCreate] ${msg} - ${details}`);
        }
    }

    /**
     * 📝 UPLOAD SPEC (SCREEN DEFINITION)
     */
    static async updateSpec(workspaceId: string, flowId: string, spec: any) {
        const account = await this.getAccount(workspaceId);
        const token = decrypt(account.access_token);

        try {
            // Validate spec before sending
            const jsonString = typeof spec === 'string' ? spec : JSON.stringify(spec);
            const parsed = JSON.parse(jsonString);
            if (!parsed.version) throw new Error("Spec is missing 'version' field – compiler error");

            console.log(`[FlowSpec] Uploading JSON (${jsonString.length} bytes) to flow: ${flowId}`);
            console.log(`[FlowSpec] Spec preview: ${jsonString.substring(0, 200)}...`);

            // Meta expects spec as a form-data file
            const formData = new FormData();
            formData.append("name", "flow.json");
            formData.append("asset_type", "FLOW_JSON");
            
            const blob = new Blob([jsonString], { type: 'application/json' });
            formData.append("file", blob, "flow.json");

            const res = await axios.post(`${BASE_URL}/${flowId}/assets`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                }
            });

            console.log(`[FlowSpec] Upload response:`, JSON.stringify(res.data));
            return res.data;
        } catch (error: any) {
            const metaMsg = error.response?.data?.error?.message;
            const metaDetails = JSON.stringify(error.response?.data?.error || {});
            const msg = metaMsg || error.message;
            console.error(`[FlowSpec] Upload failed. Meta response:`, metaDetails);
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
            // First check validation errors before attempting to publish
            const validationRes = await axios.get(
                `${BASE_URL}/${flowId}?fields=validation_errors,status`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const validationErrors = validationRes.data?.validation_errors || [];
            if (validationErrors.length > 0) {
                const errMsg = validationErrors.map((e: any) => e.message).join('; ');
                console.error(`[FlowPublish] Validation errors:`, JSON.stringify(validationErrors));
                throw new Error(`[FlowPublish] Blocked by Integrity: ${errMsg}`);
            }

            await axios.post(`${BASE_URL}/${flowId}/publish`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Use updateMany to avoid crashing if no DB record has this meta_flow_id yet
            await (prisma as any).flow.updateMany({
                where: { meta_flow_id: flowId },
                data: { meta_flow_status: "PUBLISHED" }
            });

            console.log(`[FlowPublish] Successfully published: ${flowId}`);
        } catch (error: any) {
            const metaMsg = error.response?.data?.error?.message;
            const metaDetails = JSON.stringify(error.response?.data?.error || {});
            const msg = metaMsg || error.message;
            console.error(`[FlowPublish] Publish failed. Meta response:`, metaDetails);
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
        const account = await (prisma as any).whatsAppAccount.findUnique({
            where: { workspace_id: workspaceId }
        });
        if (!account) throw new Error("WABA Account not found");
        return account;
    }
}
