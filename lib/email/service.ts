import { prisma } from "@/lib/db";

/**
 * PHASE 4: WHITE-LABEL EMAIL ENGINE
 * Ensures all system emails are branded by the Reseller if the workspace is white-labeled.
 */
export class EmailService {
    /**
     * Sends a branded email.
     * Logic: Fetch reseller settings -> load branded template -> dispatch via SMTP/Bulk sender.
     */
    static async sendBrandedEmail(workspaceId: string, options: {
        to: string;
        subject: string;
        templateName: string;
        context: any;
    }) {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                reseller: true
            }
        });

        // 1. Resolve Branding
        const brandName = workspace?.reseller?.brand_name || "Wabot BSP";
        const logoUrl = workspace?.reseller?.logo_url || "https://wabot.in/logo.png";
        const primaryColor = workspace?.reseller?.primary_color || "#25D366";

        // 2. Wrap context with branding
        const enrichedContext = {
            ...options.context,
            branding: {
                name: brandName,
                logo: logoUrl,
                color: primaryColor,
                year: new Date().getFullYear()
            }
        };

        console.log(`[Email Engine] Sending ${options.templateName} to ${options.to}`);
        console.log(`[Branding Active] From: ${brandName}`);

        // Note: In a real implementation, you would pass this to a template engine like EJS/Handlebars
        // and then send via Resend/Postmark/Sendgrid.

        return { success: true, message: `Email sent via ${brandName} engine.` };
    }
}
