
import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { decrypt } from "../../../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const formId = params.id;
        const body = await req.json();

        const form = await prisma.eduForm.findUnique({
            where: { id: formId },
            include: { workspace: { include: { waba: true } } }
        });

        if (!form) return NextResponse.json({ error: "Form not found" }, { status: 404 });

        // Extract known fields from dynamic body, store others in attributes
        const {
            student_name,
            name, // Fallback
            parent_name,
            whatsapp_number,
            phone, // Fallback
            grade,
            course_interested,
            city,
            budget_range,
            email,
            source,
            ...attributes
        } = body;

        const finalName = student_name || name || "Anonymous Lead";
        const finalPhone = whatsapp_number || phone || "";

        // 1. Create Lead
        const lead = await prisma.eduLead.create({
            data: {
                workspace_id: form.workspace_id,
                form_id: form.id,
                student_name: finalName,
                parent_name,
                whatsapp_number: finalPhone,
                email,
                grade: grade?.toString(),
                course_interested,
                city,
                budget_range,
                lead_source: source || "WEB_FORM",
                status: "NEW",
                attributes: attributes || {},
                activities: {
                    create: {
                        type: "STATUS_CHANGE",
                        content: `Lead captured via form: ${form.name}`,
                        new_status: "NEW"
                    }
                }
            }
        });

        // 2. Trigger Auto-Followup (If WABA is active)
        if (form.workspace.waba && finalPhone) {
            try {
                const flow = await prisma.flow.findFirst({
                    where: { workspace_id: form.workspace_id, name: { contains: "Edu Followup" } }
                });

                if (flow) {
                    // Logic to start flow session would go here
                    // For now we log it
                    console.log(`[Lead Engine] Triggering flow ${flow.id} for lead ${lead.id}`);
                } else {
                    const { WhatsAppService } = await import("@/lib/whatsapp/service");
                    const message = form.success_msg || `Hi ${finalName}, thank you for your inquiry. Our counselor will reach out to you shortly!`;
                    const token = decrypt(form.workspace.waba.access_token);

                    await WhatsAppService.sendText(
                        form.workspace.waba.phone_number_id,
                        token,
                        finalPhone,
                        message,
                        form.workspace_id,
                        "UTILITY",
                        "Education Form Auto-Reply"
                    );
                }
            } catch (waError) {
                console.error("[Lead Engine] WhatsApp Followup Failed:", waError);
            }
        }

        return NextResponse.json({
            success: true,
            lead_id: lead.id,
            message: form.success_msg || "Inquiry received successfully"
        });
    } catch (error) {
        console.error("Form Submission Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
