import Razorpay from "razorpay";
import { prisma } from "@/lib/db";

export class RazorpayManager {

    static async getClient(workspaceId: string) {
        const integration = await prisma.integration.findUnique({
            where: {
                workspace_id_type: {
                    workspace_id: workspaceId,
                    type: "RAZORPAY",
                },
            },
        });

        if (!integration || !integration.is_active) {
            throw new Error("Razorpay integration not found or inactive");
        }

        const { key_id, key_secret } = integration.credentials as any;

        return new Razorpay({
            key_id,
            key_secret,
        });
    }

    /**
     * Create a Standard Payment Link
     */
    static async createPaymentLink(
        workspaceId: string,
        amount: number, // In Rupee (will multiply by 100)
        currency: string = "INR",
        description: string,
        customer: { name: string; contact: string; email: string },
        notes: any = {}
    ) {
        const razorpay = await this.getClient(workspaceId);

        try {
            const link = await razorpay.paymentLink.create({
                amount: amount * 100,
                currency,
                accept_partial: false,
                description,
                customer: {
                    name: customer.name,
                    contact: customer.contact,
                    email: customer.email,
                },
                notify: {
                    sms: true,
                    email: true,
                },
                reminder_enable: true,
                notes: {
                    workspaceId,
                    ...notes
                },
            });

            return link;
        } catch (error) {
            console.error("Razorpay Link Error:", error);
            throw error;
        }
    }
}
