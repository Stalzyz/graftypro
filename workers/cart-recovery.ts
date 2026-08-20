import { CartRecoveryEngine } from "../lib/commerce/cart-recovery-engine";

/**
 * 🛒 Cart Recovery Worker
 * Designed to be run periodically (e.g. every 15 minutes) via cron or pm2.
 */
async function run() {
    console.log("[Worker] Initializing Cart Recovery Engine...");
    
    try {
        await CartRecoveryEngine.processAbandonedCarts();
        console.log("[Worker] Cart Recovery completed successfully.");
    } catch (error) {
        console.error("[Worker] Cart Recovery failed:", error);
    }
    
    process.exit(0);
}

run();
