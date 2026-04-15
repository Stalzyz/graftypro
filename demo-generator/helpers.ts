import { Page } from '@playwright/test';

/**
 * TYPES TEXT HUMANOID-STYLE: Clears, pauses, and types with random velocity.
 */
export async function humanType(page: Page, selector: string, text: string) {
    try {
        await page.waitForSelector(selector, { timeout: 10000 });
        const element = await page.$(selector);
        if (element) {
            await element.focus();
            await page.waitForTimeout(500);
            
            // Clear existing value (Command+A + Backspace)
            await page.keyboard.down('Meta');
            await page.keyboard.press('a');
            await page.keyboard.up('Meta');
            await page.keyboard.press('Backspace');
            await page.waitForTimeout(400 + Math.random() * 400);

            for (const char of text) {
                const delay = Math.floor(Math.random() * 80) + 20;
                await element.type(char, { delay });
            }
        }
    } catch (e) {
        console.warn(`[Cinematic] Skipping type for ${selector}`);
    }
}

/**
 * MOVES MOUSE SMOOTHLY: Ensures element is in view before moving.
 */
export async function humanHover(page: Page, selector: string) {
    try {
        await page.waitForSelector(selector, { timeout: 8000 });
        const element = await page.$(selector);
        if (element) {
            await element.scrollIntoViewIfNeeded();
            const box = await element.boundingBox();
            if (box) {
                const targetX = box.x + box.width / 2;
                const targetY = box.y + box.height / 2;
                await page.mouse.move(targetX, targetY, { steps: 20 });
                await page.waitForTimeout(500);
            }
        }
    } catch (e) {
        console.warn(`[Cinematic] Skipping hover for ${selector}`);
    }
}

/**
 * CLICKS WITH INTENT: Hovers first, then clicks.
 */
export async function humanClick(page: Page, selector: string) {
    await humanHover(page, selector);
    try {
        await page.click(selector, { timeout: 5000 }).catch(() => {});
    } catch (e) {}
}

/**
 * SMOOTH CINEMATIC SCROLL: Paced for reading, not logic.
 */
export async function humanScroll(target: Page | any, pixels: number, speed: number = 1.5) {
    const page = 'mouse' in target ? target : (target.page ? target.page() : null);
    if (!page) return;

    const increments = Math.abs(pixels) / speed;
    const step = pixels > 0 ? speed : -speed;
    
    for (let i = 0; i < increments; i += 2) {
        await page.mouse.wheel(0, step * 2);
        await page.waitForTimeout(16); // ~60fps smooth movement
    }
}

/**
 * SIMULATES FOCUS: Scans the mouse across text.
 */
export async function humanRead(target: Page | any, selector: string) {
    const page = 'mouse' in target ? target : (target.page ? target.page() : null);
    if (!page) return;

    try {
        await page.waitForSelector(selector, { timeout: 6000, state: 'visible' });
        const element = await page.$(selector);
        if (element) {
            await element.scrollIntoViewIfNeeded();
            const box = await element.boundingBox();
            if (box) {
                const centerY = box.y + box.height / 2;
                const startX = box.x + 10;
                const endX = box.x + box.width - 10;
                await page.mouse.move(startX, centerY, { steps: 15 });
                await page.waitForTimeout(300);
                await page.mouse.move(endX, centerY, { steps: 120 }); // Slow reading scan
                await page.waitForTimeout(500);
            }
        }
    } catch (e) {
        console.warn(`[Cinematic] Skipping read for ${selector}`);
    }
}

/**
 * NARRATIVE OVERLAY: Injects a glassmorphic presenter's box into the recording.
 */
export async function showNarrative(page: Page, text: string) {
    console.log(`💬 NARRATIVE: ${text}`);
    await page.evaluate((msg) => {
        // Remove existing overlay
        const existing = document.getElementById('grafty-cinematic-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'grafty-cinematic-overlay';
        overlay.innerHTML = `
            <div style="font-family: 'Inter', sans-serif; font-weight: 600; color: white;">
                ${msg}
            </div>
        `;
        // Premium Glassmorpic Styling
        Object.assign(overlay.style, {
            position: 'fixed',
            bottom: '40px',
            right: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '20px 30px',
            borderRadius: '16px',
            zIndex: '999999',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            maxWidth: '500px',
            transition: 'all 0.5s ease-out',
            animation: 'slideIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
        });

        // Add slide-in animation
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes slideIn {
                from { transform: translateY(100px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }, text);
}
