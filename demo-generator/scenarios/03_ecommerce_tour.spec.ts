import { test, expect } from '@playwright/test';
import { humanType, humanClick, humanHover } from '../helpers';

test('Scenario: Detailed E-commerce Tour', async ({ page }) => {
    // 1. Login
    await page.goto('/login');
    await page.waitForTimeout(1000);
    await humanType(page, 'input[name="email"]', 'demo@grafty.com');
    await page.keyboard.press('Tab');
    await humanType(page, 'input[name="password"]', 'Demo@123');
    await page.keyboard.press('Enter');

    // Wait for the overview dashboard to load fully
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
    await page.waitForTimeout(3000);

    // 2. Navigate to E-commerce Module
    const commerceLink = page.locator('a:has-text("E-commerce"), a:has-text("Commerce"), a:has-text("Store"), a[href*="/dashboard/commerce"]').first();
    await commerceLink.waitFor({ state: 'visible', timeout: 5000 });

    // Nice slow hover before clicking
    await humanHover(page, 'a:has-text("E-commerce"), a:has-text("Commerce"), a:has-text("Store"), a[href*="/dashboard/commerce"]');
    await page.waitForTimeout(1000);

    await humanClick(page, 'a:has-text("E-commerce"), a:has-text("Commerce"), a:has-text("Store"), a[href*="/dashboard/commerce"]');

    // Wait for E-commerce to load
    await page.waitForURL('**/commerce**', { timeout: 15000 }).catch(() => { });

    // Beautiful slow pause to take in the main e-commerce overview/products screen
    await page.waitForTimeout(4000);

    // Slowly scroll through products
    await page.mouse.wheel(0, 400);
    await page.waitForTimeout(3000);
    await page.mouse.wheel(0, -400);
    await page.waitForTimeout(2000);

    // 3. Navigate to Orders Tab (assuming a standard tab structure)
    // We will look for standard "Orders" text on buttons/tabs
    const ordersTab = page.locator('button:has-text("Orders"), a:has-text("Orders"), [role="tab"]:has-text("Orders")').first();
    if (await ordersTab.isVisible()) {
        await humanHover(page, 'button:has-text("Orders"), a:has-text("Orders"), [role="tab"]:has-text("Orders")');
        await page.waitForTimeout(1500);
        await humanClick(page, 'button:has-text("Orders"), a:has-text("Orders"), [role="tab"]:has-text("Orders")');

        // Let orders load and pause
        await page.waitForTimeout(4000);

        // Scroll orders list
        await page.mouse.wheel(0, 300);
        await page.waitForTimeout(2500);
        await page.mouse.wheel(0, -300);
        await page.waitForTimeout(2000);
    }

    // 4. Navigate back to Products/Inventory tab
    const productsTab = page.locator('button:has-text("Products"), a:has-text("Products"), [role="tab"]:has-text("Products"), button:has-text("Inventory")').first();
    if (await productsTab.isVisible()) {
        await humanHover(page, 'button:has-text("Products"), a:has-text("Products"), [role="tab"]:has-text("Products"), button:has-text("Inventory")');
        await page.waitForTimeout(1000);
        await humanClick(page, 'button:has-text("Products"), a:has-text("Products"), [role="tab"]:has-text("Products"), button:has-text("Inventory")');
        await page.waitForTimeout(3000);
    }

    // Final long pause before concluding
    await page.waitForTimeout(3000);
});
