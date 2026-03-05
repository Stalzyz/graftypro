import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireSuperAdmin();
        const templates = await prisma.emailTemplate.findMany({
            orderBy: { created_at: "desc" }
        });
        return NextResponse.json({ success: true, data: templates });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await requireSuperAdmin();
        const { name, slug, subject, body_html, variables } = await req.json();

        const template = await prisma.emailTemplate.create({
            data: {
                slug,
                subject,
                body_html,
                variables: variables || [],
                is_active: true
            }
        });

        return NextResponse.json({ success: true, data: template });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to create template" }, { status: 500 });
    }
}
