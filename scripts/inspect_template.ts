import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const updated = await prisma.campaign.update({
    where: { id: "92ce1079-0b44-4efb-97a5-0a03c1a23399" },
    data: {
      template_name: "quick_call",
      status: "PENDING"
    }
  });
  console.log("Updated Campaign:", JSON.stringify(updated, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
