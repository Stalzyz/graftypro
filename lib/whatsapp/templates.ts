
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
        template: any // The Prisma Template object with include: { variables: true }
    ) {
        try {
            const url = `${BASE_URL}/${wabaId}/message_templates`;

            // Transform our DB structure to Meta's strict API payload
            const payload = {
                name: template.name,
                category: template.category, // UTILITY, MARKETING, AUTHENTICATION
                language: template.language,
                components: template.components.map((c: any, index: number) => {
                    const component: any = { type: c.type };

                    if (c.type === 'HEADER') {
                        component.format = c.format; // TEXT, IMAGE, VIDEO, DOCUMENT
                        
                        if (c.format === 'TEXT') {
                            component.text = c.text;
                            // Check for variables in header
                            const headerVars = template.variables?.filter((v: any) => v.component_index === index) || [];
                            if (headerVars.length > 0) {
                                component.example = {
                                    header_text: [headerVars.map((v: any) => v.sample_value)]
                                };
                            }
                        }

                        if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)) {
                            /**
                             * CRITICAL: Meta requires a valid, publicly accessible URI for the header example.
                             * Error (#100) often stems from invalid or non-absolute URLs.
                             */
                            let mediaUrl = c.media_url || "https://grafty.pro/public/placeholder_media.png";
                            
                            // Ensure absolute URI
                            if (!mediaUrl.startsWith('http')) {
                                mediaUrl = `https://${new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://grafty.pro').host}${mediaUrl.startsWith('/') ? '' : '/'}${mediaUrl}`;
                            }

                            component.example = { header_url: [mediaUrl] };
                        }
                    }

                    if (c.type === 'BODY') {
                        component.text = c.text;
                        // Map variables to samples (Meta expects [[sample1, sample2]])
                        const bodyVars = template.variables
                            ?.filter((v: any) => v.component_index === index)
                            ?.sort((a: any, b: any) => a.param_index - b.param_index) || [];
                        
                        if (bodyVars.length > 0) {
                            component.example = {
                                body_text: [bodyVars.map((v: any) => v.sample_value || "Example")]
                            };
                        }
                    }

                    if (c.type === 'FOOTER') {
                        component.text = c.text;
                    }

                    if (c.type === 'BUTTONS') {
                        component.buttons = c.buttons.map((b: any) => {
                            const btn: any = {
                                type: b.type,
                                text: b.text
                            };
                            if (b.type === 'URL') {
                                btn.url = b.url;
                                // Handle dynamic URLs if variables exist
                                if (b.url.includes('{{1}}')) {
                                    btn.example = ["https://grafty.pro/track/123"];
                                }
                            }
                            if (b.type === 'PHONE_NUMBER') {
                                btn.phone_number = b.phone_number;
                            }
                            return btn;
                        });
                    }

                    return component;
                })
            };

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

            throw new Error(errorMessage);
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
