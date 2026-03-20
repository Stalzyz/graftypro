import { test, expect } from '@playwright/test';
import { humanType, humanClick, humanHover } from '../helpers';

test('Scenario: Create an auto-reply Flow', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Fill credentials cleanly but pause slightly for human effect
    await page.waitForTimeout(1000);
    await humanType(page, 'input[name="email"]', 'demo@grafty.com');
    await page.keyboard.press('Tab');
    await humanType(page, 'input[name="password"]', 'Demo@123');

    // Force form submission via Enter key instead of clicking the button
    // (This guarantees the React onSubmit handler fires)
    await page.keyboard.press('Enter');

    // Wait for dashboard to load
    await page.waitForURL('**/dashboard**');
    await page.waitForTimeout(1500); // Visual pause to let user see dashboard

    // Navigate to Flows (using multiple fallbacks for safety)
    const flowsLink = page.locator('a:has-text("Flow Builder"), a[href*="/flows"]').first();
    await flowsLink.waitFor({ state: 'visible', timeout: 10000 });
    await humanClick(page, 'a:has-text("Flow Builder"), a[href*="/flows"]');
    await page.waitForTimeout(1000);

    // Click Create / New Flow
    const newFlowBtn = page.locator('a:has-text("New Flow"), button:has-text("New Flow"), a:has-text("Create Flow"), button:has-text("Create Flow")').first();
    await newFlowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await newFlowBtn.click(); // Standard click since it's verified visible

    // Fill Flow details (Find any name input)
    await page.waitForURL('**/create**', { timeout: 10000 }).catch(() => { });
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="flow" i], input[type="text"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(500);
    await nameInput.focus();
    await nameInput.fill('Welcome Message & Auto-Reply');

    // Submit create form
    const submitBtn = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Continue"), button:has-text("Save")').first();
    await submitBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => { });
    if (await submitBtn.isVisible()) {
        await submitBtn.click();
    }

    // Wait for the flow builder canvas to render
    await page.waitForURL('**/builder**', { timeout: 10000 }).catch(() => { });
    await page.waitForTimeout(3000);

    // End of demo: Save the flow if possible
    const saveCanvasBtn = page.locator('button:has-text("Save"), button:has-text("Publish")').first();
    if (await saveCanvasBtn.isVisible()) {
        await saveCanvasBtn.click();
        await page.waitForTimeout(1500); // See the success toast
    }

    // End of demo pause
    await page.waitForTimeout(3000);
});
