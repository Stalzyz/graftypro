/**
 * DEBUG ENDPOINT — Remove after debugging
 * GET /api/debug-catalog
 * Shows catalog node data in all flows + commerce products
 * No auth required — TEMP DEBUG ONLY
 */
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const results: any = {
            flows_with_catalog: [],
            commerce_products: [],
            active_sessions: [],
        };

        // 1. Show ALL flows with ALL node types
        const flows = await prisma.flow.findMany({
            orderBy: { updated_at: "desc" },
        });

        results.all_flows = flows.map((flow: any) => {
            const nodes = (flow.nodes as any[]) || [];
            return {
                flow_id: flow.id,
                flow_name: flow.name,
                status: flow.status,
                trigger: flow.trigger_keyword,
                updated_at: flow.updated_at,
                node_count: nodes.length,
                node_types: nodes.map((n: any) => ({ id: n.id, type: n.type, data_keys: Object.keys(n.data || {}) })),
            };
        });

        for (const flow of flows) {
            const nodes = (flow.nodes as any[]) || [];
            const catalogNodes = nodes.filter((n: any) =>
                ["catalog", "Catalog", "product_catalog"].includes(n.type)
            );

            if (catalogNodes.length > 0) {
                results.flows_with_catalog.push({
                    flow_id: flow.id,
                    flow_name: flow.name,
                    status: flow.status,
                    trigger: flow.trigger_keyword,
                    updated_at: flow.updated_at,
                    catalog_nodes: catalogNodes.map((n: any) => ({
                        node_id: n.id,
                        productId: n.data?.productId || "❌ MISSING",
                        productName: n.data?.productName || "❌ MISSING",
                        productPrice: n.data?.productPrice || "❌ MISSING",
                        productImage: n.data?.productImage || "❌ MISSING",
                        text: n.data?.text || n.data?.label || "(empty)",
                        raw_data: n.data,
                    })),
                });
            }
        }

        // 2. Check commerce products
        try {
            const products = await (prisma as any).commerceProduct.findMany({ take: 20 });
            results.commerce_products = products.map((p: any) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                image_url: p.image_urls?.[0] || null,
                is_active: p.is_active,
            }));
        } catch (e: any) {
            results.commerce_products_error = e.message;
        }

        // 3. Check active sessions
        try {
            const sessions = await (prisma as any).flowSession.findMany({
                where: { is_completed: false },
                include: { flow: { select: { name: true, trigger_keyword: true } } },
                take: 10,
                orderBy: { created_at: "desc" },
            });
            results.active_sessions = sessions.map((s: any) => ({
                session_id: s.id,
                flow_name: s.flow?.name,
                current_node_id: s.current_node_id,
                is_waiting: s.is_waiting,
                state: s.state,
                created_at: s.created_at,
            }));
        } catch (e: any) {
            results.active_sessions_error = e.message;
        }

        return NextResponse.json(results, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
