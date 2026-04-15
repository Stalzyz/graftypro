/**
 * DEBUG SCRIPT: Check catalog node data in all flows
 * Run: npx tsx debug-catalog.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('\n🔍 [DEBUG] Checking all flows for catalog nodes...\n');

    const flows = await prisma.flow.findMany({
        orderBy: { updated_at: 'desc' }
    });

    console.log(`Found ${flows.length} total flows\n`);

    for (const flow of flows) {
        const nodes = (flow.nodes as any[]) || [];
        const catalogNodes = nodes.filter((n: any) =>
            ['catalog', 'Catalog', 'product_catalog'].includes(n.type)
        );

        if (catalogNodes.length > 0) {
            console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
            console.log(`📦 Flow: "${flow.name}" (ID: ${flow.id})`);
            console.log(`   Status: ${flow.status}`);
            console.log(`   Trigger: "${flow.trigger_keyword}"`);
            console.log(`   Updated: ${flow.updated_at}`);
            console.log(`\n   Catalog Nodes (${catalogNodes.length}):`);

            for (const node of catalogNodes) {
                const d = node.data || {};
                console.log(`\n   ► Node ID: ${node.id}`);
                console.log(`     productId:    "${d.productId || '❌ MISSING'}"`);
                console.log(`     productName:  "${d.productName || '❌ MISSING'}"`);
                console.log(`     productPrice: "${d.productPrice || '❌ MISSING'}"`);
                console.log(`     productImage: "${d.productImage || '❌ MISSING'}"`);
                console.log(`     text/desc:    "${d.text || d.label || '(empty)'}"`);
            }
        }
    }

    // Also check active sessions
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎯 Active Flow Sessions:\n');

    const sessions = await (prisma as any).flowSession.findMany({
        where: { status: 'ACTIVE' },
        include: { flow: true },
        take: 10,
        orderBy: { created_at: 'desc' }
    });

    if (sessions.length === 0) {
        console.log('   No active sessions.\n');
    }

    for (const s of sessions) {
        console.log(`   Session: ${s.id}`);
        console.log(`   Flow: "${s.flow?.name}" | Node: ${s.current_node_id}`);
        console.log(`   State: ${JSON.stringify(s.state)}\n`);
    }

    // Check commerce products
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🛍️  Commerce Products in DB:\n');

    try {
        const products = await (prisma as any).commerceProduct.findMany({
            take: 10
        });
        if (products.length === 0) {
            console.log('   ❌ NO products found in CommerceProduct table!');
            console.log('   → This is why the dropdown is empty in the flow builder.');
            console.log('   → Use the manual entry fields in the yellow box instead.\n');
        } else {
            for (const p of products) {
                console.log(`   ✅ ${p.name} | ₹${p.price} | image: ${p.image_urls?.[0] || 'none'}`);
            }
        }
    } catch (e: any) {
        console.log(`   Error reading products: ${e.message}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
