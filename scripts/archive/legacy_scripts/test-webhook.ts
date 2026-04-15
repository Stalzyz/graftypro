import { GET } from "../app/api/whatsapp/webhook/route";

async function runTest() {
    console.log("🔍 Checking Local Webhook Endpoint Layout...");

    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
    console.log(`📌 Loaded Environment Token present: "${verifyToken}"`);

    const mockUrl = `http://localhost:3001/api/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=VERIFICATION_SUCCESS`;
    
    try {
        const response = await GET(new Request(mockUrl));
        const body = await response.text();

        console.log(`🤖 Response Status: ${response.status}`);
        console.log(`🤖 Response Body: "${body}"`);

        if (response.status === 200 && body === "VERIFICATION_SUCCESS") {
            console.log("✅ Webhook passes local verify testing!");
        } else {
            console.log("❌ Webhook failed local verification response structure.");
        }
    } catch (e) {
        console.error("❌ Test crashed:", e);
    }
}

runTest();
