import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

// Meta Verification (GET)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    if (mode && token) {
        if (mode === "subscribe" && token === "SST_GRAFTY_SECURE_VERIFY") {
            return new Response(challenge, { status: 200 });
        }
    }
    return new Response("Verification failed", { status: 403 });
}

// Meta Event Handler (POST)
export async function POST(req: Request, { params }: { params: { workspace_id: string } }) {
    try {
        const workspaceId = params.workspace_id;
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId }
        });

        if (!workspace) {
            return NextResponse.json({ error: "Invalid Workspace" }, { status: 404 });
        }

        const payload = await req.json();

        // Detect Meta Leadgen Event
        if (payload.object === "page" && payload.entry) {
            for (const entry of payload.entry) {
                if (entry.changes) {
                    for (const change of entry.changes) {
                        if (change.field === "leadgen") {
                            const leadgenId = change.value?.leadgen_id;
                            const formId = change.value?.form_id;

                            // Create placeholder lead for later enrichment (since we need token to fetch fields)
                            await prisma.eduLead.create({
                                data: {
                                    workspace_id: workspaceId,
                                    student_name: `Meta Lead (${leadgenId})`,
                                    whatsapp_number: "0000000000",
                                    form_id: formId,
                                    lead_source: "META_ADS",
                                    status: "NEW",
                                    notes: `Automated ingestion from Meta Form ID: ${formId}`,
                                    activities: {
                                        create: {
                                            type: "STATUS_CHANGE",
                                            content: `Lead captured via Meta Ads (ID: ${leadgenId})`,
                                            new_status: "NEW"
                                        }
                                    }
                                }
                            });
                        }
                    }
                }
            }
            return NextResponse.json({ success: true, message: "Meta Academy Event Captured" });
        }

        return NextResponse.json({ error: "Unsupported Payload" }, { status: 400 });

    } catch (error: any) {
        console.error("Academy Webhook Error:", error);
        return NextResponse.json({ error: "Internal Error", details: error.message }, { status: 500 });
    }
}
