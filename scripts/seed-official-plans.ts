
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🚀 [SEED] Starting Official Grafty Plan Seeding...');

  const plans = [
    {
      name: 'STARTER',
      description: 'Essential WhatsApp Automation for small teams.',
      monthly_price: 1999,
      original_monthly_price: 2999,
      yearly_price: 19990,
      original_yearly_price: 29990,
      currency: 'INR',
      max_contacts: 1000,
      max_messages: 5000,
      max_flows: 10,
      max_users: 2,
      max_campaigns: 10,
      module_quick_replies: true,
      flow_builder_access: true,
      flow_msg_access: true,
      is_public: true,
      is_active: true,
      sort_order: 1,
      reseller_id: null,
      features_list: [
        'Quick Replies Access',
        'Visual Flow Builder',
        'Message Nodes Only',
        'Shared Inbox (2 Agents)',
        'Unlimited Broadcasts'
      ]
    },
    {
      name: 'GROWTH',
      description: 'Scale your sales with E-commerce and CRM.',
      monthly_price: 3999,
      original_monthly_price: 5999,
      yearly_price: 39990,
      original_yearly_price: 59990,
      currency: 'INR',
      max_contacts: 5000,
      max_messages: 25000,
      max_flows: 50,
      max_users: 10,
      max_campaigns: 50,
      module_quick_replies: true,
      module_crm: true,
      module_ecommerce: true,
      module_academy: true,
      flow_builder_access: true,
      flow_msg_access: true,
      flow_automation_access: true,
      flow_logic_access: true,
      is_public: true,
      is_active: true,
      is_featured: true,
      badge_text: 'Best Value',
      sort_order: 2,
      reseller_id: null,
      features_list: [
        'Everything in Starter',
        'CRM & Lead Management',
        'E-Commerce WhatsApp Shop',
        'Courses & Academy Engine',
        'Logic & Automation Nodes',
        'Shared Inbox (10 Agents)'
      ]
    },
    {
      name: 'ENTERPRISE',
      description: 'Ultimate scale with Drips and Integrations.',
      monthly_price: 14999,
      original_monthly_price: 24999,
      yearly_price: 149990,
      original_yearly_price: 249990,
      currency: 'INR',
      max_contacts: 50000,
      max_messages: 250000,
      max_flows: 500,
      max_users: 50,
      max_campaigns: 500,
      module_quick_replies: true,
      module_crm: true,
      module_ecommerce: true,
      module_academy: true,
      module_drip: true,
      module_integration: true,
      flow_builder_access: true,
      flow_msg_access: true,
      flow_automation_access: true,
      flow_logic_access: true,
      flow_integration_access: true,
      is_public: true,
      is_active: true,
      sort_order: 3,
      reseller_id: null,
      features_list: [
        'Everything in Growth',
        'Drip Message Sequences',
        'Advanced CRM Engine',
        'Integration Nodes (Webhooks/Shopify)',
        'Dedicated Success Manager',
        'Shared Inbox (50 Agents)'
      ]
    }
  ];

  for (const plan of plans) {
    console.log(`⏳ Processing plan: ${plan.name}...`);
    try {
      await prisma.subscriptionPlan.upsert({
        where: { name: plan.name },
        update: {
            ...plan,
            price: plan.monthly_price,
            crm_access: plan.module_crm || false,
            commerce_access: plan.module_ecommerce || false,
            edu_engine_access: plan.module_academy || false,
            drip_campaign_access: plan.module_drip || false,
            api_access: plan.module_integration || false,
        },
        create: {
            ...plan,
            price: plan.monthly_price,
            crm_access: plan.module_crm || false,
            commerce_access: plan.module_ecommerce || false,
            edu_engine_access: plan.module_academy || false,
            drip_campaign_access: plan.module_drip || false,
            api_access: plan.module_integration || false,
        },
      });
      console.log(`✅ Plan ${plan.name} synced.`);
    } catch (err: any) {
      console.error(`❌ Failed to sync plan ${plan.name}:`, err.message);
    }
  }

  console.log('✨ [SEED] Official Plan Seeding Completed!');
}

main()
  .catch((e) => {
    console.error('💥 Critical Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
