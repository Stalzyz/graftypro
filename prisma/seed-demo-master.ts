import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 INITIALIZING GRAFTY MASTER DEMO SEED (FINAL VERSION)...');

  // 1. Find or create a Master Demo Workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'master-demo-ws' },
    update: {},
    create: {
      id: 'master-demo-ws',
      name: 'Grafty Master Demo Co.',
      business_name: 'Luxury Retail & Consulting',
      status: 'ACTIVE',
      plan: 'ENTERPRISE',
    }
  });

  // 2. Create the Demo User (Login: demo@grafty.com | Pass: Demo@123)
  console.log('👤 Seeding Demo User...');
  const hashedPassword = await bcrypt.hash('Demo@123', 12);
  await prisma.user.upsert({
    where: { workspace_id_email: { workspace_id: workspace.id, email: 'demo@grafty.com' } },
    update: { password_hash: hashedPassword, email_verified: new Date() },
    create: {
      workspace_id: workspace.id,
      email: 'demo@grafty.com',
      password_hash: hashedPassword,
      first_name: 'Demo',
      last_name: 'Master',
      role: 'OWNER',
      email_verified: new Date(),
    }
  });

  // 3. Set Wallet Balance
  console.log('💳 Seeding Wallet...');
  await prisma.vendorWallet.upsert({
    where: { workspace_id: workspace.id },
    update: { current_balance: 50000.00 },
    create: {
      workspace_id: workspace.id,
      current_balance: 50000.00,
    }
  });

  // 4. Create a Commerce Store
  console.log('🏪 Seeding Commerce Store...');
  const store = await prisma.commerceStore.upsert({
    where: { id: 'master-demo-store' },
    update: {},
    create: {
      id: 'master-demo-store',
      workspace_id: workspace.id,
      name: 'Grafty Master Store',
      platform: 'NATIVE',
      status: 'ACTIVE',
    }
  });

  // 5. Seed High-Volume Commerce Products
  console.log('📦 Seeding Commerce Products...');
  for (let i = 1; i <= 20; i++) {
    await prisma.commerceProduct.upsert({
      where: { store_id_external_id: { store_id: store.id, external_id: `DEMO-PROD-${i}` } },
      update: {},
      create: {
        store_id: store.id,
        external_id: `DEMO-PROD-${i}`,
        name: `Premium Product ${i}`,
        description: `High-quality enterprise-grade product ${i} for the Grafty network.`,
        price: 999 + (i * 500),
        compare_at_price: 1499 + (i * 600),
        sku: `SKU-PRM-${i}`,
        stock: 100 + (i * 10),
        image_urls: [`https://images.unsplash.com/photo-${1581091226825 + i}?q=80&w=400&auto=format&fit=crop`],
        is_active: true,
      }
    });
  }

  // 6. Seed Contacts
  console.log('👥 Seeding Contacts...');
  const contacts = [];
  for (let i = 1; i <= 50; i++) {
    const phone = `+918888888${i.toString().padStart(3, '0')}`;
    contacts.push(await prisma.contact.upsert({
      where: { workspace_id_phone: { workspace_id: workspace.id, phone: phone } },
      update: {},
      create: {
        workspace_id: workspace.id,
        name: `Demo Lead ${i}`,
        phone: phone,
        email: `lead${i}@demo.grafty.com`,
      }
    }));
  }

  // 7. Seed Commerce Orders
  console.log('💰 Seeding Commerce Orders...');
  for (let i = 1; i <= 30; i++) {
    await prisma.commerceOrder.upsert({
      where: { store_id_external_id: { store_id: store.id, external_id: `EXT-ORD-${i}` } },
      update: {},
      create: {
        store_id: store.id,
        contact_id: contacts[i % contacts.length].id,
        external_id: `EXT-ORD-${i}`,
        order_number: `GRF-${1000 + i}`,
        status: i % 5 === 0 ? 'PLACED' : 'PAID',
        payment_status: i % 5 === 0 ? 'PENDING' : 'PAID',
        total_amount: 1500 + (Math.random() * 5000),
        subtotal: 1200 + (Math.random() * 4000),
        tax_total: 300,
        shipping_total: 0,
        discount_total: 0,
      }
    });
  }

  // 8. Seed Automation Flows
  console.log('🤖 Seeding Flows...');
  await prisma.flow.upsert({
    where: { id: 'master-demo-flow-1' },
    update: {},
    create: {
      id: 'master-demo-flow-1',
      name: 'Welcome & Qualify Bot',
      status: 'PUBLISHED',
      trigger_keyword: 'START',
      workspace_id: workspace.id,
      nodes: [
        { id: '1', type: 'message', data: { text: 'Hello! Are you looking for (1) Products or (2) Support?' } },
        { id: '2', type: 'condition', data: { if: '1', jump: '3', else: '4' } }
      ],
      edges: []
    }
  });

  console.log('✅ MASTER DEMO SEED COMPLETE!');
  console.log(`
  Demo Credentials:
  - URL: /login
  - Email: demo@grafty.com
  - Password: Demo@123
  `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
