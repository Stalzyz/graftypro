import { PrismaClient } from './lib/generated/client';

const prisma = new PrismaClient();

async function main() {
  const failedCampaigns = await prisma.campaign.findMany({
    where: { status: 'FAILED' },
    orderBy: { created_at: 'desc' },
    take: 5
  });
  console.log("Failed Campaigns:", JSON.stringify(failedCampaigns, null, 2));

  // If there's a different way campaigns are executed, let's see errors
  // Check jobs or broadcast errors if applicable
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
