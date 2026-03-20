/**
 * 🔥 GRAFTY BSP: SYNTHETIC FLOW SIMULATOR
 * Tests a Flow end-to-end bypassing the Meta Cloud API.
 * Simulates incoming messages and tracks the engine's progression.
 * 
 * Usage: npx tsx scripts/simulate-flow.ts <waba_phone_id> <user_phone> <initial_message> [reply1] [reply2] ...
 */

import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { FlowRunner } from '../lib/engine/flow-runner';

const prisma = new PrismaClient();

async function simulate() {
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.log("Usage: npx tsx scripts/simulate-flow.ts <waba_phone_id> <user_phone> <initial_trigger> [reply1] [reply2] ...");
        process.exit(1);
    }

    const wabaId = args[0];
    const phone = args[1];
    const trigger = args[2];
    const replies = args.slice(3);

    console.log(`\n🧪 [FLOW SIMULATOR] Booting synthetic tester...`);
    console.log(`- Target WABA ID: ${wabaId}`);
    console.log(`- Simulated User: ${phone}`);
    console.log(`- Initial Trigger: "${trigger}"`);

    // 1. Resolve WABA and Workspace
    const waba = await prisma.whatsAppAccount.findUnique({
        where: { phone_number_id: wabaId },
        include: { workspace: true }
    });

    if (!waba) {
        console.error(`❌ WABA Not Found! Cannot run test.`);
        process.exit(1);
    }

    const workspaceId = waba.workspace_id;

    // 2. Resolve or Create Simulated Contact
    let contact = await prisma.contact.upsert({
        where: { workspace_id_phone: { workspace_id: workspaceId, phone } },
        update: {},
        create: {
            workspace_id: workspaceId,
            phone: phone,
            name: "Synthetic Tester",
            tags: ["TEST_BOT"]
        }
    });

    console.log(`✅ Sandbox Contact Ready: ${contact.id}`);

    // Helper: Simulate single incoming normalized message
    const sendSimulatedMessage = async (text: string) => {
        const metaId = `sim_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        console.log(`\n👤 [USER]: "${text}"`);
        
        await FlowRunner.processMessage(workspaceId, contact.id, {
            phone: phone,
            type: 'text',
            value: text.toLowerCase(),
            raw: { text: { body: text }, from: phone, id: metaId },
            metaId: metaId,
            timestamp: new Date(),
            phoneNumberId: wabaId,
            contactName: "Synthetic Tester"
        });

        // Wait a bit to let async queues process if any
        await new Promise(r => setTimeout(r, 2000));
    };

    // 3. Fire Initial Trigger
    await sendSimulatedMessage(trigger);

    // 4. Fire subsequent replies
    for (const reply of replies) {
        // Assume button replies for numbers or LIST_SELECT for specialized prefixes
        let payload = reply;
        if (reply.startsWith('list:')) {
            payload = `LIST_SELECT_ID:${reply.split(':')[1]}`;
        }
        await sendSimulatedMessage(payload);
    }

    console.log(`\n✅ Flow Trace Completed. Check DB or logs for outbound messages.`);
    process.exit(0);
}

simulate();
