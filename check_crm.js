const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workspace = await prisma.workspace.findFirst({
        include: {
            crm_stages: { orderBy: { order: 'asc' } }
        }
    });

    if (!workspace) {
        console.log("No workspace found");
        return;
    }

    console.log("Workspace ID:", workspace.id);
    console.log("CRM Stages:", workspace.crm_stages.length);
    workspace.crm_stages.forEach(s => console.log(` - ${s.name} (${s.id})`));

    const totalLeads = await prisma.universalCrmLead.count({
        where: { workspace_id: workspace.id }
    });
    console.log("Total CRM Leads in this workspace:", totalLeads);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
