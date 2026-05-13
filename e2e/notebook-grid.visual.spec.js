import { expect, test } from '@playwright/test';

test.describe('notebook grid visual placement', () => {
    test('renders small arithmetic examples horizontally', async ({ page }) => {
        await page.goto('/__visual-tests/notebook-grid/small-horizontal');

        await expect(page.locator('.print-page')).toHaveScreenshot('small-horizontal.png');
    });

    test('keeps regular multi-digit arithmetic vertical', async ({ page }) => {
        await page.goto('/__visual-tests/notebook-grid/vertical-arithmetic');

        await expect(page.locator('.print-page')).toHaveScreenshot('vertical-arithmetic.png');
    });
});
