import { test, expect } from '@playwright/test';
import { humanType, humanClick, humanHover } from '../helpers';

test('Scenario: Flow Builder Master Tutorial', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes for slow tutorial

    // 1. Login
    await page.goto('/login');
    await page.waitForTimeout(1000);
    await humanType(page, 'input[name="email"]', 'demo@grafty.com');
    await page.keyboard.press('Tab');
    await humanType(page, 'input[name="password"]', 'Demo@123');
    await page.keyboard.press('Enter');

    await page.waitForURL('**/dashboard**', { timeout: 15000 });

    // 2. Navigate to Flows
    const flowsLink = page.locator('a:has-text("Flow Builder"), a:has-text("Automation"), a[href*="/flows"]').first();
    await flowsLink.waitFor({ state: 'visible', timeout: 10000 });
    await humanClick(page, 'a:has-text("Flow Builder"), a:has-text("Automation"), a[href*="/flows"]');

    // 3. Create a New Flow
    await page.waitForTimeout(1000);
    const newFlowBtn = page.locator('a:has-text("New Flow"), button:has-text("New Flow"), a:has-text("Create Flow"), button:has-text("Create Flow")').first();
    await newFlowBtn.waitFor({ state: 'visible', timeout: 10000 });
    await humanClick(page, 'a:has-text("New Flow"), button:has-text("New Flow"), a:has-text("Create Flow"), button:has-text("Create Flow")');

    // Name the Flow
    await page.waitForURL('**/create**', { timeout: 10000 }).catch(() => { });
    const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="flow" i], input[type="text"]').first();
    await nameInput.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(1000); // instructional pause
    await nameInput.focus();
    await humanType(page, 'input[name="name"], input[placeholder*="name" i], input[placeholder*="flow" i], input[type="text"]', 'Master Node Tutorial');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter'); // Submit

    // 4. In the Flow Builder Canvas
    await page.waitForURL('**/builder**', { timeout: 15000 }).catch(() => { });
    await page.waitForTimeout(4000); // Let the canvas load and show its glory

    // 5. Demonstrate the Nodes Sidebar/Panel
    // We will hover over the common node types sequentially so the viewer sees what's available
    const nodeTypes = [
        'Send Message',
        'Text',
        'Interactive',
        'List',
        'Button',
        'Condition',
        'Delay',
        'API Request',
        'Action'
    ];

    for (const type of nodeTypes) {
        // Try to find any element in the sidebar/panel with this name
        const nodeItem = page.locator(`:has-text("${type}"):not(body):not(html):not(div)`).last();
        if (await nodeItem.isVisible()) {
            await humanHover(page, `:has-text("${type}"):not(body):not(html):not(div)`);
            await page.waitForTimeout(1500); // 1.5 seconds per node hover so user can read it
        }
    }

    // 6. Demonstrate Modifying a Node's Properties
    // Usually there is a starting node on the canvas, like "Trigger" or "Start"
    // We will click the middle of the screen or look for a node object to open its sidebar
    const canvasCenter = await page.evaluate(() => ({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
    }));

    // Double click the center of the canvas assuming a node is there
    await page.mouse.dblclick(canvasCenter.x, canvasCenter.y);
    await page.waitForTimeout(2000);

    // Look for a property panel input (e.g., text, body, name) to type into
    const propInput = page.locator('textarea[placeholder*="message"], textarea, input[type="text"]').last();
    if (await propInput.isVisible({ timeout: 3000 })) {
        await propInput.focus();
        // Clear the input first just in case
        await page.keyboard.press('Meta+A');
        await page.keyboard.press('Backspace');
        await humanType(page, 'textarea[placeholder*="message"], textarea, input[type="text"]', "Hi there! This is a demo showing how to configure nodes within the visual builder.");
        await page.waitForTimeout(2000);
    }

    // 7. Save / Publish
    const saveCanvasBtn = page.locator('button:has-text("Save"), button:has-text("Publish")').first();
    if (await saveCanvasBtn.isVisible()) {
        await humanHover(page, 'button:has-text("Save"), button:has-text("Publish")');
        await page.waitForTimeout(1000);
        await saveCanvasBtn.click();
        await page.waitForTimeout(3000); // Watch the success toaster
    }

    // Final epic pause
    await page.waitForTimeout(4000);
});
