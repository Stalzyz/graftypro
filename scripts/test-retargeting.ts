
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testRetargetingLogic(campaignId: string) {
    console.log(`--- Testing Retargeting Intelligence for ${campaignId} ---`);

    // 1. FAILED
    const failed = await prisma.message.count({
        where: { campaign_id: campaignId, status: 'FAILED' }
    });

    // 2. READ (Opened but not replied)
    const read = await prisma.message.count({
        where: { campaign_id: campaignId, status: 'READ' }
    });

    // 3. UNREAD (Received but not opened)
    const unread = await prisma.message.count({
        where: { 
            campaign_id: campaignId, 
            status: { in: ['SENT', 'DELIVERED'] } 
        }
    });

    // 4. REPLIED (High Intent)
    // Find all conversions (conversations) where this campaign sent a message
    const conversations = await prisma.message.findMany({
        where: { campaign_id: campaignId },
        select: { conversation_id: true, created_at: true }
    });

    const repliedSet = new Set();
    for (const conv of conversations) {
        const reply = await prisma.message.findFirst({
            where: {
                conversation_id: conv.conversation_id,
                direction: 'INBOUND',
                created_at: { gt: conv.created_at }
            }
        });
        if (reply) repliedSet.add(conv.conversation_id);
    }

    console.log({
        failed,
        read,
        unread,
        replied: repliedSet.size
    });
}

// Usage: npx tsx scripts/test-retargeting.ts <id>
