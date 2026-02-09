import { prisma } from "@/lib/db";

export class CommerceSegmentation {
    /**
     * PHASE 7: Market Targeting Engine
     * Resolves complex commerce filters into a list of contact IDs.
     */
    static async getSegmentContacts(workspaceId: string, filters: any) {
        let where: any = { workspace_id: workspaceId, blocked: false };

        // 1. Filter by Purchase History
        if (filters.min_total_spent) {
            where.orders = {
                some: {
                    status: "PAID",
                    total_amount: { gte: parseFloat(filters.min_total_spent) }
                }
            };
        }

        // 2. Filter by Product Category
        if (filters.product_category) {
            where.orders = {
                some: {
                    items: {
                        some: {
                            product: { category: filters.product_category }
                        }
                    }
                }
            };
        }

        // 3. Last Purchase Interval
        if (filters.last_purchase_days) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(filters.last_purchase_days));

            where.orders = {
                some: {
                    status: "PAID",
                    created_at: { gte: cutoff }
                }
            };
        }

        // 4. Abandoned Cart Segment
        if (filters.is_abandoned_cart) {
            // Find contacts with events of type 'checkout.abandoned' and NO subsequent 'order.paid'
            // Simplified: look for specific event logs
            const abandonedContacts = await prisma.commerceEvent.findMany({
                where: {
                    event_type: "checkout.abandoned",
                    order: { store: { workspace_id: workspaceId } }
                },
                select: { order: { select: { customer_phone: true } } }
            });

            const phones = abandonedContacts.map(c => c.order.customer_phone).filter(Boolean);
            where.phone = { in: phones };
        }

        return await prisma.contact.findMany({
            where,
            select: { id: true, phone: true, name: true }
        });
    }
}
