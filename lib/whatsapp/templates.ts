
import axios from "axios";

const META_API_VERSION = "v20.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

/**
 * MetaTemplateService
 * Orchestrates template submission, status tracking, and synchronization with Meta.
 */
export class MetaTemplateService {

    /**
     * Submit a message template to Meta's Business API
     */
    static async submitTemplate(
        wabaId: string,
        accessToken: string,
        template: any, // The Prisma Template object with include: { variables: true }
        mediaHandle?: string // OPTIONAL: Provided if media was pre-uploaded via Resumable Upload
    ) {
        try {
            const url = `${BASE_URL}/${wabaId}/message_templates`;

            const components = Array.isArray(template.components) ? template.components : [];
            const variables = Array.isArray(template.variables) ? template.variables : [];

            // Meta requires components in a specific order: HEADER, BODY, FOOTER, BUTTONS
            const typeOrder: { [key: string]: number } = { 'HEADER': 1, 'BODY': 2, 'FOOTER': 3, 'BUTTONS': 4 };
            const sortedComponents = [...components].sort((a, b) => {
                return (typeOrder[a.type] || 99) - (typeOrder[b.type] || 99);
            });

            // Transform our DB structure to Meta's strict API payload
            const payload = {
                name: template.name,
                category: template.category, // UTILITY, MARKETING, AUTHENTICATION
                language: template.language,
                components: sortedComponents.map((c: any) => {
                    const component: any = { type: c.type };

                    if (c.type === 'HEADER') {
                        component.format = c.format; // TEXT, IMAGE, VIDEO, DOCUMENT
                        
                        if (c.format === 'TEXT') {
                            component.text = c.text;
                        }
                        
                        // Add samples if variables are present
                        const headerVars = variables.filter((v: any) => v.component_index === 0);
                        if (headerVars.length > 0 && c.format === 'TEXT') {
                            component.example = {
                                header_text: [headerVars[0].sample_value || "Sample"]
                            };
                        } else if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)) {
                             // --- NUCLEAR FIX: Priority to mediaHandle (Resumable Upload) ---
                             if (mediaHandle) {
                                 console.log(`[NUCLEAR_UPLOAD_META] Using header_handle: ${mediaHandle}`);
                                 component.example = {
                                     header_handle: [mediaHandle]
                                 };
                             } else {
                                 // Fallback to URL method
                                 const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grafty.pro";
                                 let finalUrl = c.media_url || "https://grafty.pro/placeholder.png";
                                 if (finalUrl.startsWith('/')) {
                                     finalUrl = `${APP_URL}${finalUrl}`;
                                 }
                                 console.log(`[NUCLEAR_UPLOAD_META] Falling back to header_url: ${finalUrl}`);
                                 component.example = {
                                    header_url: [finalUrl]
                                 };
                             }
                        }
                    }

                    if (c.type === 'BODY') {
                        component.text = c.text;
                        const bodyVars = variables
                            .filter((v: any) => v.component_index === (components.some((cp: any) => cp.type === 'HEADER') ? 1 : 0))
                            .sort((a: any, b: any) => a.param_index - b.param_index);
                        
                        if (bodyVars.length > 0) {
                            component.example = {
                                body_text: [bodyVars.map((v: any) => v.sample_value || "Sample")]
                            };
                        }
                    }

                    if (c.type === 'FOOTER') {
                        component.text = c.text;
                    }

                    if (c.type === 'BUTTONS') {
                        component.buttons = c.buttons.map((btn: any) => {
                            if (btn.type === 'URL' && btn.url.includes('{{1}}')) {
                                return {
                                    type: 'URL',
                                    text: btn.text,
                                    url: btn.url,
                                    example: [btn.sample_value || "https://grafty.pro"]
                                };
                            }
                            return btn;
                        });
                    }

                    return component;
                })
            };

            console.log("Submitting Meta Template Payload:", JSON.stringify(payload, null, 2));

            const response = await axios.post(url, payload, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
            });

            return {
                id: response.data.id,
                status: response.data.status || 'PENDING'
            };

        } catch (error: any) {
            console.error("Meta Template Submission Error (Trace):", JSON.stringify(error.response?.data || error.message, null, 2));
            
            const metaError = error.response?.data?.error;
            const detailedError = metaError?.error_user_msg || metaError?.error_user_title || metaError?.message || "Meta API Rejected Submission";
            let errorMessage = detailedError;

            // Map cryptic Meta errors to actionable user feedback
            if (errorMessage.includes("valid URI") || metaError?.error_subcode === 2388041 || errorMessage.includes("header_url")) {
                errorMessage = "ACTION REQUIRED: The Media URL (Image/Video/Document) in your template Header must be a valid, publicly accessible link starting with 'https://'. Please check the URL and try again.";
            } else if (errorMessage.includes("Unsupported post request") || errorMessage.includes("does not exist")) {
                errorMessage = "CONFIGURATION ERROR: Please verify that you have connected the correct 'WhatsApp Business Account ID' (WABA ID) and not your Business Manager ID.";
            } else if (errorMessage.includes("example") || errorMessage.includes("body_text") || errorMessage.includes("header_text")) {
                errorMessage = "ACTION REQUIRED: You have added variables (e.g., {{1}}) to your template, but failed to provide proper sample values. Edit the template and add samples.";
            } else if (errorMessage.includes("name") && errorMessage.includes("already exists")) {
                errorMessage = "ACTION REQUIRED: A template with this exact name already exists in your WhatsApp account. Please choose a different, unique name.";
            } else if (metaError?.code === 100) {
                // Catch-all for other param validations
                errorMessage = `META VALIDATION FAILED: ${detailedError}. Please double-check your template parameters.`;
            }

            console.error("Submission Failure Error:", errorMessage);
            throw new Error(errorMessage);
        }
    }

    /**
     * NUCLEAR FIX: Resumable Upload to Meta
     * Pushes file binary directly to Meta to get a handle, bypassing crawlers.
     */
    static async uploadMediaToMeta(
        appId: string,
        accessToken: string,
        fileBuffer: Buffer,
        mimeType: string,
        fileName: string
    ): Promise<string> {
        try {
            console.log(`[NUCLEAR_UPLOAD_META] Initializing session for: ${fileName} (${mimeType}, ${fileBuffer.length} bytes)`);

            // Phase 1: Initialize Upload Session
            const initUrl = `${BASE_URL}/${appId}/uploads`;
            const initRes = await axios.post(initUrl, null, {
                params: {
                    file_name: fileName,
                    file_length: fileBuffer.length,
                    file_type: mimeType,
                    access_token: accessToken
                }
            });

            const uploadSessionId = initRes.data.id;
            console.log(`[NUCLEAR_UPLOAD_META] Session Created: ${uploadSessionId}`);

            // Phase 2: Binary Upload
            const uploadUrl = `https://graph.facebook.com/${META_API_VERSION}/${uploadSessionId}`;
            const uploadRes = await axios.post(uploadUrl, fileBuffer, {
                headers: {
                    Authorization: `OAuth ${accessToken}`,
                    "Content-Type": "application/octet-stream"
                }
            });

            if (!uploadRes.data.h) {
                throw new Error("Failed to obtain media handle from Meta upload");
            }

            console.log(`[NUCLEAR_UPLOAD_META] SUCCESS! Handle: ${uploadRes.data.h}`);
            return uploadRes.data.h;

        } catch (error: any) {
            console.error("[NUCLEAR_UPLOAD_META] EXCEPTION:", JSON.stringify(error.response?.data || error.message, null, 2));
            throw new Error(`Meta Media Upload Failed: ${error.message}`);
        }
    }

    /**
     * Check Template Status from Meta
     */
    static async getTemplateStatus(
        wabaId: string,
        accessToken: string,
        templateName: string
    ) {
        try {
            const url = `${BASE_URL}/${wabaId}/message_templates?name=${templateName}`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });

            if (response.data.data && response.data.data.length > 0) {
                return response.data.data[0].status; // APPROVED, REJECTED, PENDING
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    /**
     * Fetch all templates from Meta
     */
    static async listTemplates(
        wabaId: string,
        accessToken: string
    ) {
        // --- MOCK BYPASS FOR TESTING ---
        if (accessToken === "test_token") {
            return [
                {
                    id: "temp_1",
                    name: "hello_world",
                    language: "en_US",
                    category: "UTILITY",
                    status: "APPROVED",
                    components: [{ type: "BODY", text: "Hello! Thank you for contacting us." }]
                },
                {
                    id: "temp_2",
                    name: "order_confirmation",
                    language: "en_US",
                    category: "UTILITY",
                    status: "APPROVED",
                    components: [{ type: "BODY", text: "Your order {{1}} has been confirmed." }]
                }
            ];
        }

        try {
            const url = `${BASE_URL}/${wabaId}/message_templates?limit=100`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${accessToken}` }
            });
            return response.data.data;
        } catch (error: any) {
            console.error("Meta List Templates Error:", error.response?.data || error.message);
            throw new Error("Failed to fetch templates from Meta");
        }
    }
}
