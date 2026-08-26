import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    where: { workspace_id: "89b6c788-d842-4bf6-8af9-bc02e84e76d2" }
  });
  console.log("Products:", JSON.stringify(products, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
