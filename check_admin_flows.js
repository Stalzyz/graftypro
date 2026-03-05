const { PrismaClient } = require('./node_modules/@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const flows = await prisma.flow.findMany({
    select: { id: true, name: true, trigger_keyword: true, status: true, workspace_id: true }
  });
  console.log("All Flows:", flows);
  
  const responders = await prisma.autoResponder.findMany({
    select: { id: true, name: true, keyword: true, status: true, match_type: true, workspace_id: true }
  });
  console.log("All Responders:", responders);
}

main().catch(console.error).finally(() => prisma.$disconnect());
