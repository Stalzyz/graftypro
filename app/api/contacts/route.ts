import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

// GET /api/contacts - List contacts for current workspace
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "20");
        const search = searchParams.get("search") || "";

        const skip = (page - 1) * limit;

        // Filter by workspace AND search term
        const whereClause = {
            workspace_id: user.workspaceId,
            OR: search
                ? [
                    { name: { contains: search, mode: "insensitive" as const } },
                    { phone: { contains: search, mode: "insensitive" as const } },
                ]
                : undefined,
        };

        const [contacts, total] = await prisma.$transaction([
            prisma.contact.findMany({
                where: whereClause,
                skip,
                take: limit,
                orderBy: { updated_at: "desc" },
            }),
            prisma.contact.count({ where: whereClause }),
        ]);

        return NextResponse.json({
            data: contacts,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Fetch Contacts Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/contacts - Create or Update Contact
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { phone, name } = body;

        if (!phone) {
            return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
        }

        // Upsert: Update if exists, Create if not
        const contact = await prisma.contact.upsert({
            where: {
                workspace_id_phone: {
                    workspace_id: user.workspaceId,
                    phone: phone,
                },
            },
            update: {
                name: name || undefined,
                updated_at: new Date(),
            },
            create: {
                workspace_id: user.workspaceId,
                phone: phone,
                name: name || "Unknown",
            },
        });

        return NextResponse.json({ success: true, contact });
    } catch (error) {
        console.error("Create Contact Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
