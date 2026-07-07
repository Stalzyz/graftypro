import { prisma } from "../db";

/**
 * 🛰️ NUCLEAR RECOVERY ENGINE
 * This script identifies campaigns stuck in DRAFT or PROCESSING status
 * and resets them to FAILED so they can be recovered via the dashboard.
 */
async function recoverStuckCampaigns() {
    console.log("🚀 Starting Campaign Recovery Engine...");
    
    try {
        const stuckThreshold = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
        
        const stuck = await prisma.campaign.updateMany({
            where: {
                status: { in: ['PROCESSING', 'DRAFT'] },
                updated_at: { lt: stuckThreshold }
            },
            data: {
                status: 'FAILED'
            }
        });
        
        console.log(`✅ Recovery Complete: Reset ${stuck.count} stuck campaigns to FAILED status.`);
    } catch (error: any) {
        console.error("❌ Recovery Engine Error:", error.message);
    } finally {
        await prisma.$disconnect();
    }
}

recoverStuckCampaigns();
