import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const includeActivities = searchParams.get("activities") === "true";

        const leads = await prisma.eduLead.findMany({
            where: { workspace_id: user.workspaceId },
            include: {
                activities: includeActivities ? { orderBy: { created_at: "desc" }, take: 5 } : false,
                form: true
            },
            orderBy: { updated_at: "desc" }
        });

        return NextResponse.json({ data: leads });
    } catch (error) {
        console.error("GET Education Leads Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            student_name, parent_name, whatsapp_number, email,
            grade, course_interested, budget_range, city,
            form_id, lead_source
        } = body;

        const lead = await prisma.eduLead.create({
            data: {
                workspace_id: user.workspaceId,
                form_id,
                student_name,
                parent_name,
                whatsapp_number,
                email,
                grade,
                course_interested,
                budget_range,
                city,
                lead_source: lead_source || "MANUAL",
                status: "NEW",
                activities: {
                    create: {
                        type: "STATUS_CHANGE",
                        content: "Lead created manually",
                        new_status: "NEW"
                    }
                }
            }
        });

        return NextResponse.json({ success: true, data: lead });
    } catch (error: any) {
        console.error("CREATE Education Lead Error:", error);
        return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
    }
}
