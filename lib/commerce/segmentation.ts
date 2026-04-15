import { prisma } from "../db";

export class CommerceSegmentation {
    /**
     * PHASE 7: Market Targeting Engine
     * Resolves complex commerce filters into a list of contact IDs.
     */
    static async getSegmentContacts(workspaceId: string, filters: any) {
        if (!filters || Object.keys(filters).length === 0) {
            return await prisma.contact.findMany({
                where: { workspace_id: workspaceId, blocked: false, opt_in: true },
                select: { id: true, phone: true, name: true }
            });
        }

        let where: any = { workspace_id: workspaceId, blocked: false, opt_in: true };

        // 1. Handle Order-based Filters (with AND combination)
        const orderFilters: any[] = [];
        if (filters.min_total_spent) {
            orderFilters.push({ total_amount: { gte: parseFloat(filters.min_total_spent) }, status: "PAID" });
        }
        if (filters.product_category) {
            orderFilters.push({ 
                items: { some: { product: { category: filters.product_category } } } 
            });
        }
        if (filters.last_purchase_days) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(filters.last_purchase_days));
            orderFilters.push({ status: "PAID", created_at: { gte: cutoff } });
        }

        if (orderFilters.length > 0) {
            where.commerce_orders = {
                some: { AND: orderFilters }
            };
        }

        // 2. Handle Tag Filtering (Nuclear Fix for "test" tag issue)
        if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
            where.tags = { hasSome: filters.tags };
        }

        // 3. Last Active Range
        if (filters.last_active_days) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - parseInt(filters.last_active_days));
            where.last_active_at = { gte: cutoff };
        }

        // 4. Precision Retargeting Engine (Multi-Tier)
        if (filters.retarget_campaign_id) {
            const pid = filters.retarget_campaign_id;
            const type = filters.retarget_type; // READ, UNREAD, FAILED, REPLIED

            if (type === "READ") {
                where.messages = { some: { campaign_id: pid, status: "READ" } };
            } else if (type === "UNREAD") {
                where.messages = { 
                    some: { campaign_id: pid, status: { in: ["SENT", "DELIVERED"] } },
                    none: { campaign_id: pid, status: "READ" }
                };
            } else if (type === "FAILED") {
                where.messages = { some: { campaign_id: pid, status: "FAILED" } };
            } else if (type === "REPLIED") {
                // Anyone who has an INBOUND message in a conversation that was tagged with this campaign
                where.messages = { 
                    some: { 
                        campaign_id: pid,
                        conversation: {
                            messages: {
                                some: { direction: "INBOUND" }
                            }
                        }
                    }
                };
            }
        }

        // 5. Abandoned Cart Segment
        if (filters.is_abandoned_cart) {
            const abandonedEvents = await prisma.commerceEvent.findMany({
                where: {
                    event_type: "checkout.abandoned",
                    order: { store: { workspace_id: workspaceId } }
                },
                select: { order: { select: { contact: { select: { phone: true } } } } }
            });
            const phones = abandonedEvents.map(e => e.order.contact?.phone).filter(Boolean);
            if (phones.length === 0) return []; // Strict return for no abandoned carts
            where.phone = { in: phones as string[] };
        }

        const contacts = await prisma.contact.findMany({
            where,
            select: { id: true, phone: true, name: true }
        });

        return contacts;
    }
}
