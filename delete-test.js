const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const account = await prisma.whatsAppAccount.findFirst()
  if (!account) return console.log("No WhatsApp Account found")
  console.log("Found:", account)
  try {
    await prisma.whatsAppAccount.delete({
       where: { id: account.id }
    })
    console.log("Successfully deleted")
  } catch (e) {
    console.error("Delete failed:", e)
  }
}

main().finally(() => prisma.$disconnect())
