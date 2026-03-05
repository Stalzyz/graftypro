import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const waba = await prisma.whatsAppAccount.findFirst()
  if (!waba) return console.log("No waba found")
  console.log("Found waba:", waba.workspace_id)
  
  try {
    await prisma.whatsAppAccount.deleteMany({
      where: { workspace_id: waba.workspace_id }
    })
    console.log("Success")
  } catch(e) {
    console.error("Prisma Error:", e)
  }
}

main().catch(console.error).finally(()=>prisma.$disconnect())
