
import { prisma } from "../lib/db";
import { FlowRunner } from "../lib/engine/flow-runner";
import { AppointmentService } from "../lib/services/appointment-service";

async function diagnose() {
    console.log("🔍 Starting Interactive Commerce Engine Diagnosis...");

    try {
        // 1. Check DB Connection
        const workspaceCount = await prisma.workspace.count();
        console.log(`✅ DB Connection: OK (${workspaceCount} workspaces found)`);

        // 2. Setup Test Context
        let testWorkspace = await prisma.workspace.findFirst({ where: { name: "Diagnosis Test" } });
        if (!testWorkspace) {
            testWorkspace = await prisma.workspace.create({
                data: {
                    name: "Diagnosis Test",
                }
            });
        }

        let testContact = await prisma.contact.findFirst({
            where: { workspace_id: testWorkspace.id, phone: "1234567890" }
        });
        if (!testContact) {
            testContact = await prisma.contact.create({
                data: {
                    workspace_id: testWorkspace.id,
                    phone: "1234567890",
                    name: "Test User"
                }
            });
        }

        console.log(`✅ Test Context Setup: Workspace ${testWorkspace.id}, Contact ${testContact.id}`);

        // 3. Create a Test Flow
        const flowData = {
            nodes: [
                { id: 'start', type: 'start', position: { x: 0, y: 0 }, data: { label: 'HI' } },
                { id: 'msg1', type: 'message', position: { x: 200, y: 0 }, data: { text: 'Welcome! Reply with "BOOK" to start.' } },
                { id: 'cond1', type: 'condition', position: { x: 400, y: 0 }, data: { operator: 'equals', value: 'BOOK' } },
                { id: 'msg2', type: 'message', position: { x: 600, y: -100 }, data: { text: 'Please enter Slot ID:' } },
                { id: 'appt1', type: 'appointment', position: { x: 800, y: -100 }, data: {} },
                { id: 'msg_success', type: 'message', position: { x: 1000, y: -150 }, data: { text: 'Booking Success!' } },
                { id: 'msg_fail', type: 'message', position: { x: 1000, y: -50 }, data: { text: 'Booking Failed.' } },
                { id: 'msg_other', type: 'message', position: { x: 600, y: 100 }, data: { text: 'You did not say BOOK.' } },
            ],
            edges: [
                { id: 'e1', source: 'start', target: 'msg1' },
                { id: 'e2', source: 'msg1', target: 'cond1' },
                { id: 'e3', source: 'cond1', target: 'msg2', sourceHandle: 'true' },
                { id: 'e4', source: 'cond1', target: 'msg_other', sourceHandle: 'false' },
                { id: 'e5', source: 'msg2', target: 'appt1' },
                { id: 'e6', source: 'appt1', target: 'msg_success', sourceHandle: 'true' },
                { id: 'e7', source: 'appt1', target: 'msg_fail', sourceHandle: 'false' },
            ]
        };

        const flow = await prisma.flow.create({
            data: {
                workspace_id: testWorkspace.id,
                name: "Diagnosis Flow",
                trigger_keyword: "HI",
                nodes: flowData.nodes as any,
                edges: flowData.edges as any,
                status: "PUBLISHED"
            }
        });

        console.log(`✅ Test Flow Created: ${flow.id}`);

        // 4. Simulate Interaction
        console.log("\n--- SIMULATING CONVERSATION ---");

        // Step A: Trigger HI
        console.log("Input: HI");
        await FlowRunner.processMessage(testWorkspace.id, testContact.id, "HI");

        let session = await prisma.flowSession.findFirst({
            where: { contact_id: testContact.id, is_completed: false },
            orderBy: { created_at: 'desc' }
        });
        console.log(`Current Node: ${session?.current_node_id} (Expected: msg1)`);

        // Step B: Reply BOOK
        console.log("\nInput: BOOK");
        await FlowRunner.processMessage(testWorkspace.id, testContact.id, "BOOK");
        session = await prisma.flowSession.findFirst({ where: { id: session?.id } });
        console.log(`Current Node: ${session?.current_node_id} (Expected: msg2)`);

        // Step C: Provide Slot ID (Invalid)
        console.log("\nInput: INVALID_SLOT_123");
        await FlowRunner.processMessage(testWorkspace.id, testContact.id, "INVALID_SLOT_123");
        session = await prisma.flowSession.findFirst({ where: { id: session?.id } });
        console.log(`Current Node: ${session?.current_node_id} (Expected: msg_fail)`);

        // Step D: Cleanup and Test Valid Slot
        console.log("\n--- TESTING VALID SLOT ---");
        await prisma.flowSession.deleteMany({ where: { contact_id: testContact.id } });

        // Create a slot
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + 1);
        await AppointmentService.createDefaultSlots(testWorkspace.id, futureDate);
        const validSlot = await prisma.appointmentSlot.findFirst({ where: { workspace_id: testWorkspace.id } });

        console.log(`Input: HI`);
        await FlowRunner.processMessage(testWorkspace.id, testContact.id, "HI");
        console.log(`Input: BOOK`);
        await FlowRunner.processMessage(testWorkspace.id, testContact.id, "BOOK");
        console.log(`Input: ${validSlot?.id}`);
        await FlowRunner.processMessage(testWorkspace.id, testContact.id, validSlot?.id || "");

        session = await prisma.flowSession.findFirst({
            where: { contact_id: testContact.id },
            orderBy: { created_at: 'desc' }
        });
        console.log(`Current Node: ${session?.current_node_id} (Expected: msg_success)`);

        // 5. Check Appointments Table
        const apptCount = await prisma.appointment.count({ where: { contact_id: testContact.id } });
        console.log(`\n✅ Appointment Check: ${apptCount} records found.`);

        console.log("\n✨ Diagnosis Finished Successfully!");

    } catch (error) {
        console.error("❌ Diagnosis Failed:", error);
    }
}

diagnose();
