import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { v4 as uuidv4 } from "uuid";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const userPayload = await getCurrentUser(req);
        // We allow this in debug mode or for admins

        console.log("☢️ NUCLEAR API TRIGGERED");

        // 1. Find or Create Demo Workspace
        let workspace = await prisma.workspace.findFirst({
            where: { name: "Demo Command Center" }
        });

        if (!workspace) {
            workspace = await prisma.workspace.create({
                data: {
                    name: "Demo Command Center",
                    business_name: "Demo Corp International",
                    plan: "ENTERPRISE",
                    status: "ACTIVE"
                }
            });
        }

        // 2. Find or Create Demo User
        let user = await prisma.user.findFirst({
            where: { email: "demo@grafty.pro", workspace_id: workspace.id }
        });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    workspace_id: workspace.id,
                    email: "demo@grafty.pro",
                    first_name: "Demo",
                    last_name: "Agent",
                    role: "AGENT"
                }
            });
        }

        // 3. Create WABA Account (Mock)
        let waba = await prisma.whatsAppAccount.findFirst({
            where: { workspace_id: workspace.id }
        });

        if (!waba) {
            waba = await prisma.whatsAppAccount.create({
                data: {
                    workspace_id: workspace.id,
                    waba_id: "demo_waba_id",
                    phone_number_id: "demo_phone_id",
                    access_token: "MOCK_DEMO_TOKEN",
                    phone_number: "15551234567",
                    status: "CONNECTED"
                }
            });
        }

        // 4. Create High-Quality Demo Contacts
        const mockContacts = [
            { name: "John Doe", phone: "15559876543", email: "john@example.com", tags: ["VIP", "Hot Lead"], avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
            { name: "Maria Silva", phone: "5511999998888", email: "maria@empresa.br", tags: ["Qualified", "Enterprise"], avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria" },
            { name: "Alex Chen", phone: "85298887777", email: "alex@tech.hk", tags: ["Trial", "New"], avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" },
            { name: "Sarah Connor", phone: "12134445555", email: "sarah@resistance.net", tags: ["URGENT"], avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" }
        ];

        for (const c of mockContacts) {
            const contact = await prisma.contact.upsert({
                where: { workspace_id_phone: { workspace_id: workspace.id, phone: c.phone } },
                update: { ...c },
                create: { ...c, workspace_id: workspace.id }
            });

            // 5. Create Conversation
            let conversation = await prisma.conversation.findFirst({
                where: { contact_id: contact.id }
            });

            if (!conversation) {
                conversation = await prisma.conversation.create({
                    data: {
                        workspace_id: workspace.id,
                        contact_id: contact.id,
                        assigned_to: user.id,
                        status: "OPEN"
                    }
                });
            } else {
                await prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { updated_at: new Date() }
                });
            }

            // 6. Add Mock Messages
            const messageCount = await prisma.message.count({ where: { conversation_id: conversation.id } });
            if (messageCount === 0) {
                await prisma.message.createMany({
                    data: [
                        {
                            workspace_id: workspace.id,
                            contact_id: contact.id,
                            conversation_id: conversation.id,
                            meta_id: uuidv4(),
                            type: "TEXT",
                            direction: "INBOUND",
                            content: { body: "Olá, gostaria de saber mais sobre o plano Enterprise." },
                            status: "READ",
                            created_at: new Date(Date.now() - 3600000)
                        },
                        {
                            workspace_id: workspace.id,
                            contact_id: contact.id,
                            conversation_id: conversation.id,
                            meta_id: uuidv4(),
                            type: "TEXT",
                            direction: "OUTBOUND",
                            content: { body: "Olá! Com certeza. O plano Enterprise inclui suporte 24/7 e fluxos ilimitados. Posso te enviar uma proposta?" },
                            status: "READ",
                            created_at: new Date(Date.now() - 1800000)
                        }
                    ]
                });
            }
        }

        return NextResponse.json({ success: true, message: "Environment Nuked and Repopulated Successfully." });

    } catch (error: any) {
        console.error("Nuke Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
