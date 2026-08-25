/**
 * 🛒 SEED ECOMMERCE FLOW FOR GREKAM WORKSPACE
 * Seeds a complete E-Commerce / Package Info flow for Grekam Academy (workspace 89b6c788...)
 * 
 * Run: npx ts-node --project tsconfig.json seed_grekam_ecommerce.ts
 */

import { prisma } from './lib/db';

const WORKSPACE_ID = '3485d9e1-a29b-4ca6-bef8-d38f91b052b3'; // Grekam Academy

const EDGE_STYLE = { stroke: '#94a3b8', strokeWidth: 2 };

function makeEdge(id: string, source: string, target: string, sourceHandle: string | null = null) {
    return {
        id,
        type: 'smoothstep',
        style: EDGE_STYLE,
        source,
        target,
        animated: false,
        sourceHandle,
        targetHandle: null,
    };
}

async function main() {
    console.log(`🔍 Seeding Ecommerce Flow for workspace: ${WORKSPACE_ID}`);

    // Verify workspace exists
    const workspace = await prisma.workspace.findUnique({ where: { id: WORKSPACE_ID } });
    if (!workspace) {
        console.error(`❌ Workspace ${WORKSPACE_ID} not found!`);
        return;
    }
    console.log(`✅ Workspace found: ${workspace.name}`);

    // Check for existing ecommerce flow
    const existing = await prisma.flow.findFirst({
        where: { workspace_id: WORKSPACE_ID, name: { contains: 'E-Commerce' } }
    });

    if (existing) {
        console.log(`⚠️  Ecommerce flow already exists: ${existing.name} (${existing.id})`);
        console.log(`   Current Trigger: ${existing.trigger_keyword}`);
        console.log(`   Updating trigger keywords to comprehensive set...`);

        await prisma.flow.update({
            where: { id: existing.id },
            data: {
                trigger_keyword: 'hi, hello, ecommerce, shopify, quote, price, package, atlas, web, get quote, info, start, menu',
                status: 'PUBLISHED',
            }
        });

        console.log(`✅ Updated trigger keywords!`);
    } else {

    // ──────────────────────────────────────────────────────────────────────
    // BUILD FLOW NODES
    // ──────────────────────────────────────────────────────────────────────
    const nodes: any[] = [];
    const edges: any[] = [];

    // 1. START / TRIGGER NODE
    nodes.push({
        id: 'start_1',
        type: 'start',
        data: {
            text: 'hi, hello, ecommerce, shopify, quote, price, package, atlas, web',
            label: 'Trigger: ecommerce keywords'
        },
        position: { x: 50, y: 260 },
        width: 240,
        height: 64,
    });

    // 2. WELCOME MESSAGE
    nodes.push({
        id: 'msg_welcome',
        type: 'message',
        data: {
            label: 'Welcome Message',
            contentType: 'TEXT',
            text: `👋 *Welcome to Grekam Academy!*\n\nWe offer world-class E-Commerce & Web Development solutions.\n\nPlease select a package below to see full details:`,
            buttons: [
                { id: 'btn_shopify', title: '🛒 Shopify ₹25,000', type: 'reply' },
                { id: 'btn_ecommerce', title: '🛍️ Custom Ecom ₹45,000', type: 'reply' },
                { id: 'btn_atlas', title: '⚡ Atlas Enterprise', type: 'reply' },
            ]
        },
        position: { x: 360, y: 200 },
        width: 280,
        height: 200,
    });
    edges.push(makeEdge('e_start_welcome', 'start_1', 'msg_welcome'));

    // 3a. SHOPIFY PACKAGE DETAILS
    nodes.push({
        id: 'msg_shopify',
        type: 'message',
        data: {
            label: 'Shopify Package',
            contentType: 'TEXT',
            text: `🛒 *Shopify Standard Solution*\n\n💰 Price: ₹25,000\n\n✅ What's included:\n• Complete Shopify store setup\n• Payment gateway integration\n• WhatsApp order alerts\n• 10 product listings\n• Mobile responsive design\n• 1 month post-launch support\n\n📞 Ready to get started? Reply *YES* or call +91 9789359407`,
        },
        position: { x: 720, y: 50 },
        width: 280,
        height: 200,
    });

    // 3b. CUSTOM ECOM PACKAGE DETAILS
    nodes.push({
        id: 'msg_ecommerce',
        type: 'message',
        data: {
            label: 'Custom E-Commerce Package',
            contentType: 'TEXT',
            text: `🛍️ *Custom E-Commerce Platform*\n\n💰 Price: ₹45,000\n\n✅ What's included:\n• Full custom branding & UI\n• Inventory manager\n• GST invoicing system\n• Abandoned cart recovery\n• WhatsApp order management\n• 3 months post-launch support\n\n📞 Interested? Reply *YES* or call +91 9789359407`,
        },
        position: { x: 720, y: 300 },
        width: 280,
        height: 200,
    });

    // 3c. ATLAS ENTERPRISE DETAILS
    nodes.push({
        id: 'msg_atlas',
        type: 'message',
        data: {
            label: 'Atlas Enterprise',
            contentType: 'TEXT',
            text: `⚡ *Atlas Enterprise Web Development*\n\n💰 Starting at: ₹75,000\n\n✅ What's included:\n• Custom high-performance web app\n• Full admin control panel\n• Advanced analytics dashboard\n• API integrations\n• 12 months support\n🌐 Live Demo: https://atlasadmin.grekam.in/login\n\n📞 Book a demo call! Reply *DEMO* or call +91 9789359407`,
        },
        position: { x: 720, y: 550 },
        width: 280,
        height: 200,
    });

    // Connect button responses to package nodes
    edges.push(makeEdge('e_welcome_shopify', 'msg_welcome', 'msg_shopify', 'btn_shopify'));
    edges.push(makeEdge('e_welcome_ecommerce', 'msg_welcome', 'msg_ecommerce', 'btn_ecommerce'));
    edges.push(makeEdge('e_welcome_atlas', 'msg_welcome', 'msg_atlas', 'btn_atlas'));

    // 4. COLLECT CONTACT INFO
    nodes.push({
        id: 'collect_name',
        type: 'collect_input',
        data: {
            text: '👤 Great choice! Please enter your *full name*:',
            label: 'Collect Name',
            variableName: 'customer_name'
        },
        position: { x: 1080, y: 300 },
        width: 250,
        height: 100,
    });

    nodes.push({
        id: 'collect_phone',
        type: 'collect_input',
        data: {
            text: '📱 Please share your *best contact number*:',
            label: 'Collect Phone',
            variableName: 'contact_phone'
        },
        position: { x: 1080, y: 440 },
        width: 250,
        height: 100,
    });

    edges.push(makeEdge('e_shopify_name', 'msg_shopify', 'collect_name'));
    edges.push(makeEdge('e_ecommerce_name', 'msg_ecommerce', 'collect_name'));
    edges.push(makeEdge('e_atlas_name', 'msg_atlas', 'collect_name'));
    edges.push(makeEdge('e_name_phone', 'collect_name', 'collect_phone'));

    // 5. CONFIRMATION
    nodes.push({
        id: 'msg_confirm',
        type: 'message',
        data: {
     
    nodes.push({
        id: 'node_end',
        type: 'end',
        data: { label: 'Flow Complete' },
        position: { x: 1760, y: 400 },
        width: 180,
        height: 64,
    });

    edges.push(makeEdge('e_phone_confirm', 'collect_phone', 'msg_confirm'));
    edges.push(makeEdge('e_confirm_end', 'msg_confirm', 'node_end'));

    // ──────────────────────────────────────────────────────────────────────
    // CREATE FLOW
    // ──────────────────────────────────────────────────────────────────────
    const FLOW_ID = `grekam-ecommerce-flow-${Date.now()}`;
    const flow = await prisma.flow.create({
        data: {
            id: FLOW_ID,
            workspace_id: WORKSPACE_ID,
            name: '🛒 Grekam E-Commerce & Web Dev Packages',
            trigger_keyword: 'hi, hello, ecommerce, shopify, quote, price, package, atlas, web, get quote, info, start, menu',
            nodes: nodes as any,
            edges: edges as any,
            status: 'PUBLISHED',
        },
    });

    console.log(`\n✅ Ecommerce Flow created successfully!`);
    console.log(`   ID:      ${flow.id}`);
    console.log(`   Name:    ${flow.name}`);
    console.log(`   Status:  ${flow.status}`);
    console.log(`   Triggers: ${flow.trigger_keyword}`);
    console.log(`\n🎯 The flow will trigger when someone DMs: hi, hello, ecommerce, shopify, etc.`);
    } // end else block

    // ──────────────────────────────────────────────────────────────────────
    // CHECK: Instagram credentials for this workspace
    // ──────────────────────────────────────────────────────────────────────
    const igIntegration = await (prisma as any).integration.findFirst({
        where: { workspace_id: WORKSPACE_ID, type: 'INSTAGRAM' }
    });

    const ws = await prisma.workspace.findUnique({ where: { id: WORKSPACE_ID } });
    const igSettingsCreds = (ws?.settings as any)?.integrations?.INSTAGRAM;

    console.log(`\n📱 Instagram Integration Status:`);
    if (igIntegration) {
        console.log(`   ✅ Found in Integration table`);
        console.log(`   Active: ${igIntegration.is_active}`);
        console.log(`   Has access_token: ${!!(igIntegration.credentials as any)?.access_token}`);
    } else if (igSettingsCreds) {
        console.log(`   ✅ Found in Workspace Settings JSON`);
        console.log(`   Active: ${igSettingsCreds.is_active}`);
        console.log(`   Has access_token: ${!!igSettingsCreds?.credentials?.access_token}`);
    } else {
        console.log(`   ❌ NO Instagram credentials found for Grekam workspace!`);
        console.log(`   👉 Go to Settings → Integrations → Connect Instagram to fix this.`);
    }
}

main()
    .catch((e) => console.error('❌ Seeding failed:', e))
    .finally(() => prisma.$disconnect());
space.findUnique({ where: { id: WORKSPACE_ID } });
    const igSettingsCreds = (ws?.settings as any)?.integrations?.INSTAGRAM;

    console.log(`\n📱 Instagram Integration Status:`);
    if (igIntegration) {
        console.log(`   ✅ Found in Integration table`);
        console.log(`   Active: ${igIntegration.is_active}`);
        console.log(`   Has access_token: ${!!(igIntegration.credentials as any)?.access_token}`);
    } else if (igSettingsCreds) {
        console.log(`   ✅ Found in Workspace Settings JSON`);
        console.log(`   Active: ${igSettingsCreds.is_active}`);
        console.log(`   Has access_token: ${!!igSettingsCreds?.credentials?.access_token}`);
    } else {
        console.log(`   ❌ NO Instagram credentials found for Grekam workspace!`);
        console.log(`   👉 Go to Settings → Integrations → Connect Instagram to fix this.`);
    }
}

main()
    .catch((e) => console.error('❌ Seeding failed:', e))
    .finally(() => prisma.$disconnect());
