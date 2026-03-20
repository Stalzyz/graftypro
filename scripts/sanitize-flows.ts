/**
 * 🔥 GRAFTY BSP: DATABASE FLOW SANITIZER
 * Scans all flows in the database and applies the deterministic validation engine.
 * Automatically fixes orphaned edges, missing data, and schema inconsistencies.
 * 
 * Usage: npx tsx scripts/sanitize-flows.ts
 */

import { PrismaClient } from '@prisma/client';
import { validateFlowData } from '../lib/engine/node-validator';

const prisma = new PrismaClient();

async function sanitize() {
    console.log(`\n🧹 [SANITIZER] Starting global flow cleanup...\n`);

    const flows = await prisma.flow.findMany();
    console.log(`🔍 Found ${flows.length} flows to audit.`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const flow of flows) {
        try {
            const rawNodes = flow.nodes as any[] || [];
            const rawEdges = flow.edges as any[] || [];

            // Run validation (which also does self-healing)
            const { cleanedNodes: finalNodes, cleanedEdges: finalEdges, errors } = validateFlowData(rawNodes, rawEdges);

            // Check if anything actually changed
            const nodesChanged = JSON.stringify(rawNodes) !== JSON.stringify(finalNodes);
            const edgesChanged = JSON.stringify(rawEdges) !== JSON.stringify(finalEdges);

            if (nodesChanged || edgesChanged) {
                console.log(`✨ [FIXED] Flow "${flow.name}" (${flow.id})`);
                if (errors.length > 0) console.log(`  - Errors: ${errors.join(', ')}`);

                await prisma.flow.update({
                    where: { id: flow.id },
                    data: {
                        nodes: finalNodes as any,
                        edges: finalEdges as any,
                        updated_at: new Date()
                    }
                });
                fixedCount++;
            }
        } catch (err: any) {
            console.error(`❌ [ERROR] Failed to sanitize flow ${flow.id}: ${err.message}`);
            errorCount++;
        }
    }

    console.log(`\n✅ Sanitization Complete:`);
    console.log(`- Flows Audited: ${flows.length}`);
    console.log(`- Flows Fixed: ${fixedCount}`);
    console.log(`- Failures: ${errorCount}`);

    process.exit(0);
}

sanitize();
