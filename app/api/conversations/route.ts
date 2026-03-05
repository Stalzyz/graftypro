import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const filter = searchParams.get("filter"); // all, me, unassigned, unread, follow_up, drip
        const query = searchParams.get("q");

        let where: any = { workspace_id: user.workspaceId };

        // 1. Core Filters
        if (filter === 'me') {
            where.assigned_to = user.userId;
        } else if (filter === 'unassigned') {
            where.assigned_to = null;
        } else if (filter === 'unread') {
            where.messages = {
                some: {
                    direction: "INBOUND",
                    status: { not: "READ" }
                }
            };
        } else if (filter === 'follow_up') {
            where.contact = {
                follow_ups: {
                    some: {
                        status: "PENDING",
                        scheduled_at: { lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } // Active or due in 24h
                    }
                }
            };
        } else if (filter === 'drip') {
            where.contact = {
                drip_enrollments: {
                    some: {
                        status: "ACTIVE"
                    }
                }
            };
        }

        // 2. Search Query (Search in name or phone)
        if (query) {
            where.OR = [
                { contact: { name: { contains: query, mode: 'insensitive' } } },
                { contact: { phone: { contains: query } } },
            ];
        }

        const conversations = await prisma.conversation.findMany({
            where,
            include: {
                contact: true,
                agent: {
                    select: {
                        id: true,
                        first_name: true,
                        email: true
                    }
                },
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1
                }
            },
            orderBy: { updated_at: "desc" }
        });

        // Calculate unread count for each (mocking logic for now)
        const enrichedConversations = conversations.map(conv => ({
            ...conv,
            unreadCount: filter === 'unread' ? 1 : 0 // Simplified for MVP
        }));

        return NextResponse.json({ data: enrichedConversations });
    } catch (error) {
        console.error("List Conversations Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { phone } = await req.json();
        if (!phone) return NextResponse.json({ error: "Phone number is required" }, { status: 400 });

        // Clean phone number (remove +, spaces, etc)
        const cleanPhone = phone.replace(/\D/g, "");

        // 1. Find or create contact
        const contact = await prisma.contact.upsert({
            where: {
                workspace_id_phone: {
                    workspace_id: user.workspaceId,
                    phone: cleanPhone
                }
            },
            update: {},
            create: {
                workspace_id: user.workspaceId,
                phone: cleanPhone,
                name: "New Lead",
                attributes: {}
            }
        });

        // 2. Find or create open conversation
        let conversation = await prisma.conversation.findFirst({
            where: {
                workspace_id: user.workspaceId,
                contact_id: contact.id,
                status: "OPEN"
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    workspace_id: user.workspaceId,
                    contact_id: contact.id,
                    status: "OPEN"
                }
            });
        }

        return NextResponse.json({ data: conversation });
    } catch (error) {
        console.error("Start Conversation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
