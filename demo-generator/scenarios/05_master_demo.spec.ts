import { test, expect } from '@playwright/test';
import { humanType, humanClick, humanHover } from '../helpers';

/**
 * PRODUCTION-GRADE MASTER DEMO RECORDING
 * 15 Phases of Grafty BSP Dashboard
 */
test('Scenario: Grafty - Fully Automated Master Demo', async ({ page }) => {
    // Global Timeout for this massive demo: 10 minutes
    test.setTimeout(600000);

    // cinematic pause helper
    const cinematicPause = async (ms = 3000) => await page.waitForTimeout(ms);

    // ==========================================
    // Phase 1 — Login and Dashboard Overview
    // ==========================================
    await page.goto('/login');
    await cinematicPause(1500);
    await humanType(page, 'input[name="email"]', 'demo@grafty.com');
    await page.keyboard.press('Tab');
    await humanType(page, 'input[name="password"]', 'Demo@123');
    await page.keyboard.press('Enter');

    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await cinematicPause(3000); // Let the full dashboard settle

    // Hover over stats cards
    await humanHover(page, 'div:has-text("Total Contacts")');
    await page.waitForTimeout(1000);
    await humanHover(page, 'div:has-text("Revenue")');
    await page.waitForTimeout(1000);

    // Scroll dashboard
    await page.mouse.wheel(0, 500);
    await cinematicPause(2000);
    await page.mouse.wheel(0, -500);
    await cinematicPause(2000);

    // ==========================================
    // Phase 2 — WhatsApp Channel Settings
    // ==========================================
    // Navigate to Settings
    const settingsLink = page.locator('a:has-text("Settings"), a[href*="/settings"]').first();
    await settingsLink.waitFor({ state: 'visible' });
    await humanClick(page, 'a:has-text("Settings"), a[href*="/settings"]');
    await cinematicPause(2000);

    // Sub-nav to WhatsApp
    const waLink = page.locator('a:has-text("WhatsApp"), [href*="/whatsapp"]').first();
    if (await waLink.isVisible()) {
        await humanClick(page, 'a:has-text("WhatsApp"), [href*="/whatsapp"]');
    }
    await page.waitForURL('**/whatsapp**', { timeout: 10000 }).catch(() => { });
    await cinematicPause(3000);

    // Show connection details
    await page.mouse.wheel(0, 300);
    await cinematicPause(2000);

    // ==========================================
    // Phase 3 — Flow Builder Overview
    // ==========================================
    const flowsLink = page.locator('a:has-text("Flow Builder"), a[href*="/flows"]').first();
    await humanClick(page, 'a:has-text("Flow Builder"), a[href*="/flows"]');
    await page.waitForURL('**/flows**', { timeout: 15000 });
    await cinematicPause(2500);

    // ==========================================
    // Phase 4 — Demonstrate Flow Creation
    // ==========================================
    const newFlowBtn = page.locator('a:has-text("New Flow"), button:has-text("New Flow"), a:has-text("Create Flow"), button:has-text("Create Flow")').first();
    await humanClick(page, 'a:has-text("New Flow"), button:has-text("New Flow"), a:has-text("Create Flow"), button:has-text("Create Flow")');

    await page.waitForURL('**/create**', { timeout: 10000 }).catch(() => { });
    await cinematicPause(1500);

    // Type name in the top bar input
    await humanType(page, 'input[placeholder*="Flow Name"]', 'Demo Sales Automation Flow');
    await cinematicPause(1500);

    // Click the "Save" button in the top bar
    const saveBtn = page.locator('button:has-text("Save")').first();
    await humanClick(page, 'button:has-text("Save")');

    // Wait for the redirect to /dashboard/flows/[id]
    await page.waitForURL(/\/dashboard\/flows\/[0-9a-f-]{36}/, { timeout: 20000 });
    await cinematicPause(4000);

    // ==========================================
    // Phase 5 — Demonstrate Node Types (Sampler)
    // ==========================================
    // Scroll through node library in the sidebar
    const sidebar = page.locator('aside').first();
    await sidebar.hover();
    await page.mouse.wheel(0, 600);
    await cinematicPause(2000);
    await page.mouse.wheel(0, -600);
    await cinematicPause(1500);

    // Demonstrate interaction with a few representative nodes (hover in sidebar)
    const nodeTypesToDemo = ['Interactive List', 'Payment Request', 'Condition', 'API Call'];
    for (const type of nodeTypesToDemo) {
        const node = page.locator(`aside :has-text("${type}"):not(body)`).first();
        if (await node.isVisible()) {
            await node.hover();
            await cinematicPause(1500);
        }
    }

    // ==========================================
    // Phase 7 — Template Builder
    // ==========================================
    await humanClick(page, 'a:has-text("Templates"), a[href*="/templates"]');
    await page.waitForURL('**/templates**', { timeout: 10000 });
    await cinematicPause(3000);
    await page.mouse.wheel(0, 400);
    await cinematicPause(2000);

    // ==========================================
    // Phase 8 — Broadcast Campaign Module
    // ==========================================
    await humanClick(page, 'a:has-text("Broadcast"), a[href*="/campaigns"]');
    await page.waitForURL('**/campaigns**', { timeout: 10000 });
    await cinematicPause(3000);
    // Show one campaign stats hover
    const campaignRow = page.locator('tr, div[class*="CampaignRow"]').first();
    if (await campaignRow.isVisible()) {
        await campaignRow.hover();
        await cinematicPause(2000);
    }

    // ==========================================
    // Phase 9 — Drip Campaign Module
    // ==========================================
    await humanClick(page, 'a:has-text("Drip"), a[href*="/drips"]');
    await page.waitForURL('**/drips**', { timeout: 10000 });
    await cinematicPause(3000);

    // ==========================================
    // Phase 10 — CRM / Lead Engine
    // ==========================================
    await humanClick(page, 'a:has-text("CRM"), a:has-text("Contacts"), a[href*="/crm"]');
    await page.waitForURL('**/crm**', { timeout: 10000 }).catch(() => page.waitForURL('**/contacts**'));
    await cinematicPause(3000);
    // Scroll contact list
    await page.mouse.wheel(0, 500);
    await cinematicPause(2000);

    // ==========================================
    // Phase 11 — Ecommerce Module
    // ==========================================
    await humanClick(page, 'a:has-text("Commerce"), a[href*="/commerce"]');
    await page.waitForURL('**/commerce**', { timeout: 10000 });
    await cinematicPause(3000);
    await page.mouse.wheel(0, 400);
    await cinematicPause(2000);

    // ==========================================
    // Phase 12 — Analytics Dashboard
    // ==========================================
    await humanClick(page, 'a:has-text("Analytics"), a[href*="/analytics"]');
    await page.waitForURL('**/analytics**', { timeout: 10000 });
    await cinematicPause(4000);
    await page.mouse.wheel(0, 600);
    await cinematicPause(2000);

    // ==========================================
    // Phase 13 — Partner / Reseller Dashboard
    // ==========================================
    await page.goto('/partner/dashboard');
    await page.waitForURL('**/partner/dashboard**', { timeout: 15000 }).catch(() => { });
    await cinematicPause(4000);
    await page.mouse.wheel(0, 500);
    await cinematicPause(2500);

    // ==========================================
    // Phase 14 — Super Admin Panel
    // ==========================================
    await page.goto('/super-admin/dashboard');
    await page.waitForURL('**/super-admin/dashboard**', { timeout: 15000 }).catch(() => { });
    await cinematicPause(4000);
    await page.mouse.wheel(0, 800);
    await cinematicPause(3000);

    // ==========================================
    // Phase 15 — Final System Overview
    // ==========================================
    await page.goto('/dashboard');
    await page.waitForURL('**/dashboard**', { timeout: 10000 });
    await cinematicPause(2000);
    await page.mouse.wheel(0, 1200);
    await cinematicPause(3000);
    await page.mouse.wheel(0, -1200);

    // Hold final screen
    console.log("Holding final Grafty screen...");
    await cinematicPause(7000);
});
