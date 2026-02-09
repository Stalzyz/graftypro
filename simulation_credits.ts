import { prisma } from "./lib/db";
import { CreditService } from "./lib/credits/service";

/**
 * PHASE 9: LOAD & CONCURRENCY SIMULATION
 * This script simulates 100 concurrent message sends for a single vendor
 * who only has enough balance for 50 messages.
 * Goal: Verify that the system stops at exactly 50 and NO negative balance occurs.
 */
async function simulateConcurrentDeductions() {
    console.log("🚀 Starting Load Simulation: Concurrent Deductions...");

    const WORKSPACE_ID = "load-test-workspace"; // Ensure this exists or create it
    const MESSAGE_COST = 1.0;
    const INITIAL_BALANCE = 50.0;
    const TOTAL_REQUESTS = 100;

    // 1. Setup Test Wallet
    await prisma.vendorWallet.upsert({
        where: { workspace_id: WORKSPACE_ID },
        update: { current_balance: INITIAL_BALANCE, total_used: 0 },
        create: { workspace_id: WORKSPACE_ID, current_balance: INITIAL_BALANCE }
    });

    console.log(`Initial Balance: ${INITIAL_BALANCE}`);

    // 2. Prepare 100 Concurrent Promises
    const requests = Array.from({ length: TOTAL_REQUESTS }).map((_, i) => {
        return prisma.$transaction(async (tx) => {
            try {
                return await CreditService.deductCredits(
                    tx,
                    WORKSPACE_ID,
                    MESSAGE_COST,
                    `LOAD-TEST-${Date.now()}-${i}`,
                    `Load Test Request ${i}`
                );
            } catch (error: any) {
                return { error: error.message };
            }
        });
    });

    // 3. Execute
    const results = await Promise.all(requests);

    // 4. Analyze
    const successCount = results.filter(r => !(r as any).error).length;
    const failureCount = results.filter(r => (r as any).error).length;

    const finalWallet = await prisma.vendorWallet.findUnique({
        where: { workspace_id: WORKSPACE_ID }
    });

    console.log("\n--- Simulation Results ---");
    console.log(`Successful Deductions: ${successCount}`);
    console.log(`Failed Deductions: ${failureCount}`);
    console.log(`Final Balance: ${finalWallet?.current_balance}`);

    if (successCount === INITIAL_BALANCE / MESSAGE_COST && Number(finalWallet?.current_balance) === 0) {
        console.log("✅ PASS: Correct number of deductions and zero balance.");
    } else {
        console.log("❌ FAIL: Balance mismatch or over-deduction.");
    }
}

simulateConcurrentDeductions()
    .catch(console.error)
    .finally(() => process.exit());
