import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const contact = await prisma.contact.findUnique({
            where: {
                id: params.id,
                // Security: Ensure contact belongs to requesting user's workspace
                workspace_id: user.workspaceId,
            },
            include: {
                conversations: {
                    orderBy: { updated_at: "desc" },
                    take: 5,
                },
            },
        });

        if (!contact) {
            return NextResponse.json({ error: "Contact not found" }, { status: 404 });
        }

        return NextResponse.json({ data: contact });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await prisma.contact.delete({
            where: {
                id: params.id,
                workspace_id: user.workspaceId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, email, tags } = await req.json();

        const contact = await prisma.contact.update({
            where: {
                id: params.id,
                workspace_id: user.workspaceId
            },
            data: {
                name,
                email,
                tags
            }
        });

        return NextResponse.json({ success: true, data: contact });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
