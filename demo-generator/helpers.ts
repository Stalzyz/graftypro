import { Page } from '@playwright/test';

/**
 * Types text with a random delay between keystrokes to simulate human typing.
 */
export async function humanType(page: Page, selector: string, text: string) {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    if (element) {
        await element.focus();
        // Optional: add a tiny visual pause before starting to type
        await page.waitForTimeout(500);
        for (const char of text) {
            // Random delay between 30ms and 150ms per keystroke
            const delay = Math.floor(Math.random() * 120) + 30;
            await element.type(char, { delay });
        }
    }
}

/**
 * Moves mouse to the element smoothly before clicking, to simulate human movement.
 * Requires some custom mouse step calculations.
 */
export async function humanHover(page: Page, selector: string) {
    await page.waitForSelector(selector);
    const element = await page.$(selector);
    if (element) {
        const box = await element.boundingBox();
        if (box) {
            // Move to center of the element
            const targetX = box.x + box.width / 2;
            const targetY = box.y + box.height / 2;
            await page.mouse.move(targetX, targetY, { steps: 10 });
            // Minor pause before doing anything next
            await page.waitForTimeout(200 + Math.random() * 300);
        }
    }
}

/**
 * Slowly hovers over an element, pauses, then clicks it.
 */
export async function humanClick(page: Page, selector: string) {
    await humanHover(page, selector);
    await page.click(selector);
    // Optional: add a minor visual pause after clicking
    await page.waitForTimeout(300 + Math.random() * 400);
}
