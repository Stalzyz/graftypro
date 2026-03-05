
import axios from "axios";

const META_API_VERSION = "v18.0";
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export class MetaTemplateService {

    /**
     * Submit a template to Meta's Business API
     */
    static async submitTemplate(
        wabaId: string,
        accessToken: string,
        template: any // The Prisma Template object
    ) {
        try {
            const url = `${BASE_URL}/${wabaId}/message_templates`;

            // Transform our DB structure to Meta's API payload
            const payload = {
                name: template.name,
                category: template.category,
                language: template.language,
                components: template.components.map((c: any) => {
                    const component: any = { type: c.type };

                    if (c.type === 'HEADER') {
                        component.format = c.format; // TEXT, IMAGE, VIDEO, DOCUMENT
                        if (c.format === 'TEXT') {
                            component.text = c.text;
                            // Add samples if variables exist in header
                        }
                        if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(c.format)) {
                            // For media headers, Meta requires a 'example' file handle or link during submission
                            const mediaUrl = c.media_url || "https://grafty.pro/placeholder_media.png";
                            component.example = { header_url: [mediaUrl] };
                        }
                    }

                    if (c.type === 'BODY') {
                        component.text = c.text;
                        // Map variables to samples
                        const bodyVars = template.variables?.filter((v: any) => v.component_index === 0) || [];
                        if (bodyVars.length > 0) {
                            component.example = {
                                body_text: [bodyVars.map((v: any) => v.sample_value)]
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
                                // Handle dynamic URLs if variables exist in URL
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
            console.error("Meta Template Submission Error:", error.response?.data || error.message);
            const metaError = error.response?.data?.error?.message || "Meta API Rejected Submission";
            throw new Error(metaError);
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
        if (accessToken === "test_token" || process.env.NODE_ENV === "development") {
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
