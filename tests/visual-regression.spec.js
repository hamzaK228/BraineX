import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Visual Regression Tests with Playwright
 * Captures screenshots and compares with baselines
 */

const pages = [
    { url: '/', name: 'homepage' },
    { url: '/fields', name: 'fields' },
    { url: '/scholarships', name: 'scholarships' },
    { url: '/mentors', name: 'mentors' },
    { url: '/projects', name: 'projects' },
    { url: '/events', name: 'events' },
];

const viewports = [
    { width: 1920, height: 1080, name: 'desktop' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 375, height: 667, name: 'mobile' },
];

const themes = ['light', 'dark'];

test.describe('Visual Regression Tests', () => {
    for (const page of pages) {
        for (const viewport of viewports) {
            for (const theme of themes) {
                test(`${page.name} - ${viewport.name} - ${theme}`, async ({ page: playwrightPage }) => {
                    // Set viewport
                    await playwrightPage.setViewportSize({
                        width: viewport.width,
                        height: viewport.height,
                    });

                    // Navigate to page
                    await playwrightPage.goto(`http://localhost:3000${page.url}`);

                    // Wait for page to be fully loaded
                    await playwrightPage.waitForLoadState('networkidle');

                    // Set theme
                    if (theme === 'dark') {
                        await playwrightPage.evaluate(() => {
                            document.documentElement.setAttribute('data-theme', 'dark');
                        });
                        await playwrightPage.waitForTimeout(500);
                    }

                    // Take screenshot
                    const screenshotPath = `tests/visual-regression/screenshots/${page.name}-${viewport.name}-${theme}.png`;
                    await playwrightPage.screenshot({
                        path: screenshotPath,
                        fullPage: true,
                    });

                    // Compare with baseline
                    const baselinePath = `tests/visual-regression/baselines/${page.name}-${viewport.name}-${theme}.png`;

                    if (fs.existsSync(baselinePath)) {
                        // Visual comparison
                        await expect(playwrightPage).toHaveScreenshot(`${page.name}-${viewport.name}-${theme}.png`, {
                            maxDiffPixels: 100,
                            threshold: 0.2,
                        });
                    } else {
                        // Create baseline
                        fs.mkdirSync(path.dirname(baselinePath), { recursive: true });
                        fs.copyFileSync(screenshotPath, baselinePath);
                        console.log(`Created baseline: ${baselinePath}`);
                    }
                });
            }
        }
    }
});

test.describe('Component Visual Tests', () => {
    test('Navigation header', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.waitForLoadState('networkidle');

        const header = await page.locator('header');
        await expect(header).toHaveScreenshot('header.png');
    });

    test('Scholarship card', async ({ page }) => {
        await page.goto('http://localhost:3000/scholarships');
        await page.waitForLoadState('networkidle');

        const card = await page.locator('.scholarship-card').first();
        await expect(card).toHaveScreenshot('scholarship-card.png');
    });

    test('Modal dialog', async ({ page }) => {
        await page.goto('http://localhost:3000');
        await page.click('text=Log In');
        await page.waitForSelector('#login-modal');

        const modal = await page.locator('#login-modal');
        await expect(modal).toHaveScreenshot('login-modal.png');
    });
});

test.describe('Interactive State Tests', () => {
    test('Hover states', async ({ page }) => {
        await page.goto('http://localhost:3000');

        const button = await page.locator('.btn').first();
        await button.hover();
        await expect(button).toHaveScreenshot('button-hover.png');
    });

    test('Focus states', async ({ page }) => {
        await page.goto('http://localhost:3000');

        const button = await page.locator('.btn').first();
        await button.focus();
        await expect(button).toHaveScreenshot('button-focus.png');
    });

    test('Active states', async ({ page }) => {
        await page.goto('http://localhost:3000/scholarships');
        await page.waitForLoadState('networkidle');

        const filterButton = await page.locator('#category-filter');
        await filterButton.click();
        await expect(filterButton).toHaveScreenshot('filter-active.png');
    });
});
