
import { jsPDF } from "jspdf";
import fs from "fs";
import path from "path";

async function generateGraftyPdf() {
    const doc = new jsPDF();
    const margin = 20;
    let y = 30;

    const addText = (text: string, size = 12, isBold = false) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", isBold ? "bold" : "normal");
        const lines = doc.splitTextToSize(text, 170);
        lines.forEach((line: string) => {
            if (y > 270) {
                doc.addPage();
                y = 30;
            }
            doc.text(line, margin, y);
            y += size * 0.6;
        });
        y += 5;
    };

    // --- PAGE 1: INTRODUCTION ---
    addText("GRAFTY BSP: THE NEURAL BRAIN CENTER", 22, true);
    addText("Official Master Training Document v1.2", 14, true);
    y += 10;

    addText("1. OVERVIEW & ORIGINS", 16, true);
    addText("Grafty is the leading WhatsApp Business Solution Provider (BSP) engineered for the Indian market. It is a product of Grekam, headquartered in Peelamedu, Coimbatore (www.grekam.in). Our mission is to democratize elite-level WhatsApp automation for Small and Medium Enterprises (SMEs) in India, particularly across Tamil Nadu, Karnataka, and Kerala.", 12);
    
    addText("2. THE AI SMART HANDOFF SYSTEM", 16, true);
    addText("The Grafty AI is not a simple chatbot; it is a Business Orchestrator. It supports 'Intent-Based Flow Handoff'. If a user expresses interest in a specific action, the AI can trigger interactive buttons and automated Meta Flows.", 12);
    
    // --- PAGE 2: REGIONAL FOCUS ---
    addText("3. REGIONAL NUANCES & LANGUAGE", 16, true);
    addText("Grafty is designed to feel native to South India. The AI is trained to understand and respond in:", 12);
    addText("- Tanglish (Tamil + English): Ideal for Chennai and Coimbatore markets.");
    addText("- Kanglish (Kannada + English): Essential for the Bangalore startup ecosystem.");
    addText("- Malayalam: Catering to the growing digital economy in Kerala.");
    addText("- Hinglish: For pan-India reach including North Indian stakeholders.");

    addText("4. PRODUCT MODULES", 16, true);
    addText("- Lead Follow-up Engine: The core power of Grafty. Automated nudges ensure no lead is lost.");
    addText("- AI Knowledge Base: RAG-based intelligence using PDFs and URLs.");
    addText("- WhatsApp Commerce: Catalogues, ordering, and payments.");
    addText("- Flow Builder: Drag-and-drop Meta Flow orchestrator.");

    // --- PAGE 3: TECHNICAL MASTERCLASS ---
    addText("5. META CLOUD API DEEP-DIVE", 16, true);
    addText("Understanding the plumbing of WhatsApp Automation:", 12);
    addText("A. Verification: Use Meta Business Manager (FBM) to verify your domain and ID to unlock the Green Tick.");
    addText("B. Pricing Model: Meta charges per 24-hour conversation window. Conversations are categorized into Marketing, Utility, Authentication, and Service.");
    addText("C. Templates: All business-initiated messages must use approved Templates.");
    addText("D. Flows: Advanced interactive forms that stay entirely inside WhatsApp.");

    addText("6. INDIAN PRICING TIERS", 16, true);
    addText("- STARTER: Rs. 999/month (Perfect for local shops).", 12, true);
    addText("- GROWTH: Rs. 2,999/month (Scale focused for growing SMEs).");
    addText("- ENTERPRISE: Rs. 14,999/month (Agency and high-volume ready).");

    addText("7. CONTACT & SUPPORT", 16, true);
    addText("Physical Office: Grekam Academy, Peelamedu, Coimbatore, Tamil Nadu.");
    addText("Website: www.grekam.in | Support: Available via Grafty WhatsApp Portal.");

    // EXPORT
    const buffer = doc.output("arraybuffer");
    const outputPath = path.resolve(process.cwd(), "public/uploads/knowledge/Grafty_Master_Training.pdf");
    fs.writeFileSync(outputPath, Buffer.from(buffer));
    console.log(`✅ Success: PDF generated at ${outputPath}`);
}

generateGraftyPdf().catch(console.error);
