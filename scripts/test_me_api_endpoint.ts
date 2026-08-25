import { prisma } from '../lib/db';
import { getAbsoluteMediaUrl } from '../lib/utils/url';

async function testMeEndpoint() {
    const users = await prisma.user.findMany({
        where: {
            role: { in: ['ADMIN', 'AGENT'] }
        },
        include: {
            workspace: {
                include: {
                    addons: {
                        where: { status: 'ACTIVE' },
                        include: { addon: true }
                    }
                }
            }
        }
    });

    console.log(`🔍 Testing /api/auth/me logic for ${users.length} Admin/Agent users...`);

    for (const user of users) {
        try {
            console.log(`\nTesting User: ${user.email} (Role: ${user.role}, Workspace ID: ${user.workspace_id})`);
            
            if (!user.workspace) {
                console.log(`🚨 User has no workspace relation!`);
                continue;
            }

            // Execute the exact plan resolution logic from /api/auth/me
            const workspace = user.workspace as any;
            
            // Try fetching the plan_details if current_plan_id is set
            let planDetails = null;
            if (workspace.current_plan_id) {
                planDetails = await prisma.subscriptionPlan.findUnique({
                    where: { id: workspace.current_plan_id }
                });
            }

            let resolvedPlan = planDetails || { 
                name: workspace.plan,
                module_crm: workspace.plan === "ENTERPRISE" || workspace.plan === "PRO",
                module_ecommerce: workspace.plan === "ENTERPRISE",
                module_academy: workspace.plan === "ENTERPRISE",
                module_drip: workspace.plan === "ENTERPRISE",
                module_integration: workspace.plan === "ENTERPRISE"
            };

            if (workspace.plan === "ENTERPRISE" || resolvedPlan.name?.toUpperCase() === "ENTERPRISE") {
                resolvedPlan.module_crm = true;
                resolvedPlan.module_ecommerce = true;
                resolvedPlan.module_academy = true;
                resolvedPlan.module_drip = true;
                resolvedPlan.module_integration = true;
                resolvedPlan.drip_campaign_access = true;
            }

            const formattedUser = {
                ...user,
                avatar_url: getAbsoluteMediaUrl(user.avatar_url),
                workspace: {
                    ...workspace,
                    plan: resolvedPlan,
                    addons: workspace.addons.map((wa: any) => wa.addon.name)
                },
                hasPassword: !!user.password_hash
            };

            console.log(`✅ Success! Resolved plan name: ${formattedUser.workspace.plan.name}`);
        } catch (err: any) {
            console.error(`❌ FAILED for ${user.email}:`, err.message || err);
        }
    }
}

testMeEndpoint()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
