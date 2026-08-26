import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const campaign = await prisma.campaign.findUnique({
    where: { id: "92ce1079-0b44-4efb-97a5-0a03c1a23399" }
  });
  console.log("Campaign:", JSON.stringify(campaign, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
