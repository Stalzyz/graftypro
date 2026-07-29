import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Searching for Grekam workspace...');
  const workspaces = await prisma.workspace.findMany({
    where: {
      name: { contains: 'grekam', mode: 'insensitive' }
    }
  });

  if (workspaces.length === 0) {
    console.log('No workspace found with name containing "grekam"');
    return;
  }

  for (const workspace of workspaces) {
    console.log(`\nWorkspace: ${workspace.name} (ID: ${workspace.id})`);
    
    const campaigns = await prisma.campaign.findMany({
      where: { workspace_id: workspace.id },
      orderBy: { created_at: 'desc' },
      take: 5
    });
    
    console.log('Recent Campaigns:');
    for (const campaign of campaigns) {
      console.log(`- ${campaign.name} (ID: ${campaign.id}) | Status: ${campaign.status} | Created: ${campaign.created_at}`);
      if (campaign.error_message || campaign.last_error) {
         console.log(`  Error: ${campaign.error_message || campaign.last_error}`);
      }
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
