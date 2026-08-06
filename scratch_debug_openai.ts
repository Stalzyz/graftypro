import OpenAI from "openai";

async function run() {
    console.log("=== TESTING OPENAI API KEY CONFIGURED IN ENV ===");
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("No OPENAI_API_KEY found in process.env");
        return;
    }
    console.log("API Key found. Length:", apiKey.length);
    console.log("First 15 chars:", apiKey.substring(0, 15));

    const openai = new OpenAI({ apiKey });
    try {
        console.log("Sending chat completion test...");
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: "Hello! If you receive this, reply with 'OpenAI Key is working!'" }],
            max_tokens: 20
        });
        console.log("Response:", response.choices[0].message.content);
        console.log("✅ API Key is fully functional!");
    } catch (e: any) {
        console.error("❌ OpenAI API Key Test Failed:", e.message || e);
    }
}

run();
