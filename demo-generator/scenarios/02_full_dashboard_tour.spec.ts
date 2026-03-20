import { test, expect } from '@playwright/test';
import { humanType, humanClick, humanHover } from '../helpers';

test('Scenario: Full Dashboard Tour', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.waitForTimeout(1000);
    await humanType(page, 'input[name="email"]', 'demo@grafty.com');
    await page.keyboard.press('Tab');
    await humanType(page, 'input[name="password"]', 'Demo@123');
    await page.keyboard.press('Enter');

    // Wait for the overview dashboard to load fully
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    // Pause on Overview to show charts
    await page.waitForTimeout(3000);

    // Simulate reading the overview by scrolling down slightly
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(2000);
    await page.mouse.wheel(0, -300);
    await page.waitForTimeout(1000);

    // 2. Navigate to CRM / Contacts
    const crmLink = page.locator('a:has-text("CRM"), a:has-text("Contacts"), a[href*="/dashboard/crm"], a[href*="/dashboard/contacts"]').first();
    await crmLink.waitFor({ state: 'visible', timeout: 5000 });
    await humanClick(page, 'a:has-text("CRM"), a:has-text("Contacts"), a[href*="/dashboard/crm"], a[href*="/dashboard/contacts"]');

    // Wait for CRM to load and show contacts
    await page.waitForURL('**/contacts**', { timeout: 10000 }).catch(() => { });
    await page.waitForTimeout(3000);

    // Filter or click a contact to show interactivity (Optional)
    const firstContactRow = page.locator('tbody tr, .contact-row').first();
    if (await firstContactRow.isVisible()) {
        await humanHover(page, 'tbody tr, .contact-row');
        await page.waitForTimeout(1000);
    }

    // 3. Navigate to Live Chat
    const chatLink = page.locator('a:has-text("Live Chat"), a:has-text("Inbox"), a[href*="/dashboard/chat"]').first();
    await chatLink.waitFor({ state: 'visible', timeout: 5000 });
    await humanClick(page, 'a:has-text("Live Chat"), a:has-text("Inbox"), a[href*="/dashboard/chat"]');

    // Wait for Live Chat and seeded conversations to load
    await page.waitForURL('**/chat**', { timeout: 10000 }).catch(() => { });
    await page.waitForTimeout(2000);

    // Click the first conversation to open the chat window
    const firstConversation = page.locator('.conversation-list-item, [role="button"]:has-text("Alex"), [role="button"]:has-text("Jenkins"), a[href*="/chat/"]').first();
    if (await firstConversation.isVisible()) {
        await firstConversation.click();
        await page.waitForTimeout(2000);

        // Show typing a message
        const chatInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]').first();
        if (await chatInput.isVisible()) {
            await chatInput.focus();
            await humanType(page, 'input[placeholder*="message"], textarea[placeholder*="message"]', "That's a great question! Let me pull up those limits for you.");
            await page.waitForTimeout(1000);
            // We won't actually send to avoid dirtying data further, just show the action.
        }
    } else {
        await page.waitForTimeout(3000);
    }

    // 4. Navigate to Campaigns / Broadcasts
    const campaignsLink = page.locator('a:has-text("Broadcasts"), a:has-text("Campaigns"), a[href*="/dashboard/campaigns"]').first();
    await campaignsLink.waitFor({ state: 'visible', timeout: 5000 });
    await humanClick(page, 'a:has-text("Broadcasts"), a:has-text("Campaigns"), a[href*="/dashboard/campaigns"]');

    await page.waitForURL('**/campaigns**', { timeout: 10000 }).catch(() => { });
    await page.waitForTimeout(3000); // Wait to show the beautiful campaign stats

    // Scroll campaign list if needed
    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(1500);

    // 5. Navigate to Flow Builder
    const flowsLink = page.locator('a:has-text("Flow Builder"), a:has-text("Automation"), a[href*="/dashboard/flows"]').first();
    await flowsLink.waitFor({ state: 'visible', timeout: 5000 });
    await humanClick(page, 'a:has-text("Flow Builder"), a:has-text("Automation"), a[href*="/dashboard/flows"]');

    await page.waitForURL('**/flows**', { timeout: 10000 }).catch(() => { });
    await page.waitForTimeout(3000);

    // Final pause overview
    await page.waitForTimeout(2000);
});
