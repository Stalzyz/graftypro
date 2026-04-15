import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './scenarios',
    /* Maximum time one test can run for. */
    timeout: 180 * 60 * 1000, // 3-hour buffer for cinematic recordings
    expect: {
        timeout: 10000
    },
    /* Run tests in files in parallel */
    fullyParallel: false,
    workers: 1, /* Run sequentially for reliable video recording */
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'list',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
        actionTimeout: 0,
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: 'http://localhost:3000', // Default to local dev server for recording

        /* Global recording config: Ensure high-quality 1080p recording */
        video: {
            mode: 'on',
            size: { width: 1920, height: 1080 }
        },

        /* Emulate a standard desktop screen */
        viewport: { width: 1920, height: 1080 },

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                viewport: { width: 1920, height: 1080 },
                // Ensure standard modern fonts and rendering
                deviceScaleFactor: 2, // Retina display quality for sharper videos
            },
        },
    ],

    /* Folder for test artifacts such as screenshots, videos, traces, etc. */
    outputDir: '../demo_videos/',
});
