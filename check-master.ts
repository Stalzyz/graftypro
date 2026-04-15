import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const waba = await prisma.whatsAppAccount.findFirst({
    include: { workspace: true }
  })
  if (waba) {
    console.log('--- MASTER WABA AUDIT ---')
    console.log('ID:', waba.id)
    console.log('Workspace Name:', waba.workspace.name)
    console.log('Workspace ID:', waba.workspace_id)
    console.log('Phone ID:', waba.phone_number_id)
    console.log('-------------------------')
  } else {
    console.log('❌ NO WABA detected in database. Lead handshake will not trigger.')
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect())
