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

    test('renders decimal addition alignment', async ({ page }) => {
        await page.goto('/__visual-tests/notebook-grid/decimal-addition');

        // A comma is only a few dozen pixels, far below the default ratio threshold.
        await expect(page.locator('.print-page')).toHaveScreenshot('decimal-addition.png', {
            maxDiffPixels: 20
        });
    });

    test('renders overflowing examples on the next print page', async ({ page }) => {
        await page.goto('/__visual-tests/notebook-grid/paginated-addition');

        const pages = page.locator('.print-page');
        await expect(pages).toHaveCount(5);
        await expect(pages.nth(0)).toHaveScreenshot('paginated-addition-page-1.png');
        await expect(pages.nth(4)).toHaveScreenshot('paginated-addition-page-last.png');
    });
});
