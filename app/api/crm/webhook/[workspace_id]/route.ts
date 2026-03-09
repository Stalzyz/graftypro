import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

// Meta Verification Handler (GET)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode && token) {
        if (mode === "subscribe" && token === "SST_GRAFTY_SECURE_VERIFY") {
            console.log("CRM Meta Webhook Verified");
            return new Response(challenge, { status: 200 });
        }
    }
    return new Response("Verification failed", { status: 403 });
}

export async function POST(req: Request, { params }: { params: { workspace_id: string } }) {
    try {
        const workspaceId = params.workspace_id;

        // 1. Validate Workspace
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { crm_stages: { orderBy: { order: 'asc' }, take: 1 } }
        });

        if (!workspace) {
            return NextResponse.json({ error: "Invalid Webhook Endpoint. Workspace not found." }, { status: 404 });
        }

        // 2. Parse Incoming Payload
        let payload: any = {};
        const contentType = req.headers.get("content-type") || "";

        if (contentType.includes("application/json")) {
            payload = await req.json();
        } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
            const formData = await req.formData();
            formData.forEach((value, key) => {
                payload[key] = value.toString();
            });
        } else {
            const text = await req.text();
            try { payload = JSON.parse(text); } catch (e) { /* ignore */ }
        }

        // 3. Meta Lead Ads Specific Detection
        if (payload.object === "page" && payload.entry) {
            console.log("Meta Lead Ad Event Detected:", JSON.stringify(payload, null, 2));

            // Process all entries (usually just one)
            for (const entry of payload.entry) {
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.field === "leadgen") {
                            const leadgenId = change.value?.leadgen_id;
                            const formId = change.value?.form_id;

                            // LOGIC: At this point, we SHOULD call the Meta Graph API to get the lead details
                            // However, we need a Page Access Token for that. 
                            // For now, we will create a placeholder lead that can be updated once tokens are linked.

                            const lead = await prisma.universalCrmLead.create({
                                data: {
                                    workspace_id: workspaceId,
                                    name: `Meta Lead (${leadgenId})`,
                                    source: "META_ADS",
                                    stage_id: workspace.crm_stages[0]?.id || null,
                                    custom_data: {
                                        meta_leadgen_id: leadgenId,
                                        meta_form_id: formId,
                                        status: "PENDING_FETCH"
                                    }
                                }
                            });

                            await prisma.universalCrmActivity.create({
                                data: {
                                    workspace_id: workspaceId,
                                    lead_id: lead.id,
                                    type: 'CREATED',
                                    notes: `Lead detected from Meta Form ID: ${formId}. Waiting for API fetch...`
                                }
                            });
                        }
                    }
                }
            }
            return NextResponse.json({ success: true, message: "Meta events queued" });
        }

        // 4. Standard Lead Ingestion (Google Sheets, Webhooks, etc.)
        const findField = (keys: string[]) => {
            for (const k of keys) {
                const foundKey = Object.keys(payload).find(pk => pk.toLowerCase() === k.toLowerCase());
                if (foundKey && payload[foundKey]) return { val: payload[foundKey], key: foundKey };
            }
            return { val: null, key: null };
        };

        const nameMatch = findField(["name", "full_name", "full name", "first_name", "firstname", "customer_name", "client_name"]);
        const emailMatch = findField(["email", "email_address", "mail", "email address"]);
        const phoneMatch = findField(["phone", "phone_number", "phone number", "whatsapp", "mobile", "contact_number", "contact number"]);
        const sourceMatch = findField(["source", "lead_source", "lead source", "campaign", "utm_source"]);
        const dealMatch = findField(["deal_value", "deal value", "value", "price", "amount", "budget"]);

        const rawName = nameMatch.val || "Incoming Lead Data";
        const email = emailMatch.val;
        const phone = phoneMatch.val;

        let deal_value = 0.00;
        if (dealMatch.val) {
            const parsed = parseFloat(dealMatch.val.toString().replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed)) deal_value = parsed;
        }

        const source = sourceMatch.val || "WEBHOOK API";
        const stage_id = workspace.crm_stages.length > 0 ? workspace.crm_stages[0].id : null;

        const custom_data: Record<string, any> = {};
        const reservedKeys = [nameMatch.key, emailMatch.key, phoneMatch.key, sourceMatch.key, dealMatch.key].filter(Boolean);

        Object.keys(payload).forEach(key => {
            if (!reservedKeys.includes(key)) {
                if (!["workspace_id", "token", "api_key"].includes(key.toLowerCase())) {
                    custom_data[key] = payload[key];
                }
            }
        });

        // 5. Contact Resolution
        let contactId = null;
        if (phone) {
            let cleanedPhone = phone.toString().replace(/\D/g, '');
            let contact = await prisma.contact.findFirst({
                where: { workspace_id: workspaceId, phone: cleanedPhone }
            });
            if (!contact) {
                contact = await prisma.contact.create({
                    data: {
                        workspace_id: workspaceId,
                        phone: cleanedPhone,
                        name: rawName,
                        email: email
                    }
                });
            }
            contactId = contact.id;
        }

        // 6. Create the Universal Crm Lead
        const lead = await prisma.universalCrmLead.create({
            data: {
                workspace_id: workspaceId,
                name: rawName,
                email: email || null,
                phone: phone || null,
                source: source,
                deal_value: deal_value,
                stage_id: stage_id,
                contact_id: contactId,
                custom_data: custom_data
            }
        });

        await prisma.universalCrmActivity.create({
            data: {
                workspace_id: workspaceId,
                lead_id: lead.id,
                type: 'CREATED',
                notes: `Lead ingested via ${source}`
            }
        });

        return NextResponse.json({ success: true, lead_id: lead.id }, { status: 201 });

    } catch (error: any) {
        console.error("CRM Webhook Error:", error);
        return NextResponse.json({ error: "Failed to process payload", details: error.message }, { status: 500 });
    }
}
