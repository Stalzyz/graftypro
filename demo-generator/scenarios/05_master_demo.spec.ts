import { test, expect } from '@playwright/test';
import { humanType, humanHover, humanClick, humanScroll, humanRead, showNarrative } from '../helpers';

/**
 * GRAFTY MASTERPIECE RECORDING (PROFESSIONAL PRESENTATION)
 * Full 2-Hour Deep-Dive | Cinematic Pacing | Narrative Overlays
 */
test('Scenario: Grafty - Fully Automated Masterpiece Demo', async ({ page }) => {
    // 1. Extreme Timeout: 3 Hours (10,800,000ms)
    test.setTimeout(10800000);

    // cinematic pacing config
    const pauseLength = 15000; // 15s standard hold
    const deepDiveHold = 30000; // 30s for critical features
    const transitionPause = 5000;

    const narrative = (text: string) => showNarrative(page, text);
    const hold = (ms = pauseLength) => page.waitForTimeout(ms);

    // Direct Login with Demo Override
    console.log("🎬 INITIALIZING MASTERPIECE SESSION...");
    await page.goto('/login');
    await narrative("Initializing Grafty Enterprise Session...");
    await hold(8000);
    
    await humanType(page, 'input[name="email"]', 'demo@grafty.com');
    await page.keyboard.press('Tab');
    await humanType(page, 'input[name="password"]', 'Demo@123');
    await hold(3000);
    await page.keyboard.press('Enter');

    await page.waitForURL('**/dashboard**', { timeout: 30000 });
    await narrative("Access Granted: Grafty Master Demo Co. (Enterprise)");
    await hold(15000);

    // ==========================================
    // Phase 1: Dashboard Delivery Intelligence
    // ==========================================
    await narrative("Phase 1: Real-time Growth Analytics & KPIs");
    await humanHover(page, 'div:has-text("Revenue")');
    await hold(8000);
    await humanHover(page, 'div:has-text("Total Contacts")');
    await hold(8000);
    await humanScroll(page, 900, 0.8); // Ultra-slow scroll
    await hold(20000);
    await humanScroll(page, -900, 2);

    // ==========================================
    // Phase 2: Flow Builder Canvas
    // ==========================================
    await page.goto('/dashboard/flows');
    await narrative("Phase 2: The Logic Engine — WhatsApp Flow Builder");
    await hold(12000);

    // Create a new flow live
    const createBtn = page.locator('button:has-text("Create"), a:has-text("New Flow")').first();
    if (await createBtn.isVisible()) {
        await humanClick(page, 'button:has-text("Create"), a:has-text("New Flow")');
        await page.waitForURL('**/create**', { timeout: 20000 }).catch(() => {});
        await hold(5000);
        await narrative("Designing a Custom Sales Funnel Architecture...");
        await humanType(page, 'input[placeholder*="Name"]', 'Automated Enterprise Payout Funnel');
        await hold(8000);

        // Interact with Node categories
        await narrative("Node Library: Messaging, Logic, Commerce, and Integrations.");
        const sidePanel = page.locator('aside').first();
        await sidePanel.hover();
        await humanScroll(sidePanel as any, 500, 1.5);
        await hold(10000);
        
        await humanRead(page, '*:has-text("Interactive List")');
        await hold(5000);
        await humanRead(page, '*:has-text("Condition")');
        await hold(10000);

        await narrative("Flow saved and published to the WhatsApp Cloud API.");
        await humanClick(page, 'button:has-text("Save")');
        await hold(15000);
    }

    // ==========================================
    // Phase 3: E-Commerce Architecture
    // ==========================================
    await page.goto('/dashboard/commerce');
    await narrative("Phase 3: The E-Commerce Engine — Native Store Integration");
    await hold(20000); // Admire the revenue numbers
    
    await humanScroll(page, 1200, 0.5); // Very slow reading
    await hold(25000);
    await humanScroll(page, -1200, 3);

    // ==========================================
    // Phase 4: CRM & Lead Enrichment
    // ==========================================
    await page.goto('/dashboard/crm');
    await narrative("Phase 4: CRM Engine — Universal Identity Resolution");
    await hold(15000);
    
    // Check if we have contacts, and hover over one
    const leadRow = page.locator('tr').nth(1);
    if (await leadRow.isVisible()) {
        await narrative("Inspecting Lead #001: Verified WhatsApp Identity.");
        await humanHover(page, 'tr:nth-child(2)');
        await hold(10000);
        await humanRead(page, 'tr:nth-child(2) td:nth-child(2)');
    } else {
        await narrative("CRM Pipeline is ready for high-volume message ingestion.");
    }
    await humanScroll(page, 1000, 0.8);
    await hold(20000);

    // ==========================================
    // Phase 5: Campaign Academy
    // ==========================================
    await page.goto('/dashboard/education');
    await narrative("Phase 5: Grafty Academy — Training & Best Practices");
    await hold(15000);
    await humanScroll(page, 800, 1);
    await hold(15000);

    // ==========================================
    // Phase 6: Super Admin & Payout Governance
    // ==========================================
    await page.goto('/super-admin/dashboard/packages');
    await narrative("Phase 6: Platform Governance & Multi-Reseller Control");
    await hold(10000);
    await narrative("Configuring Growth Plan Payouts at ₹2,999.");
    await humanRead(page, 'h1:has-text("Growth")');
    await hold(20000);

    // ==========================================
    // Phase 7: Partner Dashboard
    // ==========================================
    await page.goto('/partner/dashboard');
    await narrative("Phase 7: The Affiliate Partnership Ecosystem.");
    await hold(20000);
    await humanScroll(page, 600, 1);
    await hold(15000);

    // ==========================================
    // Phase 8: Strategic Closure
    // ==========================================
    await page.goto('/dashboard');
    await narrative("Grafty: The Definitive Business Messaging Solution.");
    await hold(10000);
    await narrative("Recording complete. Thank you for viewing this Masterpiece.");
    await humanScroll(page, 1500, 0.3); // Dramatic ultra-slow final scroll
    await hold(40000); // 40s final branding hold

    console.log("🏁 MASTERPIECE RECORDING COMPLETED SUCCESSFULLY.");
});
