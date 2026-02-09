import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const search = searchParams.get("search") || "";
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const skip = (page - 1) * limit;
        const segmentId = searchParams.get("segmentId");

        // Build Filter
        const whereClause: any = {
            workspace_id: user.workspaceId,
        };

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        if (segmentId && segmentId !== "all") {
            const segment = await prisma.segment.findUnique({
                where: { id: segmentId, workspace_id: user.workspaceId }
            });
            if (segment && segment.filters && (segment.filters as any).tags) {
                whereClause.tags = {
                    hasSome: (segment.filters as any).tags
                };
            }
        }

        // Execute Query
        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where: whereClause,
                orderBy: { last_active_at: "desc" },
                take: limit,
                skip: skip,
            }),
            prisma.contact.count({ where: whereClause }),
        ]);

        return NextResponse.json({
            data: contacts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { phone, name, email, tags, attributes } = body;

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        // Upsert by Phone
        const contact = await prisma.contact.upsert({
            where: {
                workspace_id_phone: {
                    workspace_id: user.workspaceId,
                    phone: phone,
                },
            },
            update: {
                name: name || undefined,
                email: email || undefined,
                tags: tags || undefined,
                attributes: attributes || undefined,
                last_active_at: new Date(),
            },
            create: {
                workspace_id: user.workspaceId,
                phone,
                name,
                email,
                tags: tags || [],
                attributes: attributes || {},
            },
        });

        return NextResponse.json(contact);

    } catch (error: any) {
        console.error("Create Contact Error:", error);
        return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
    }
}
