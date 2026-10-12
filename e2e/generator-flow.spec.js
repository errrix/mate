import { expect, test } from '@playwright/test';

const SETTINGS_STORAGE_KEY = 'math-examples-generator.settings';
const A4_WIDTH_PX = 210 * 96 / 25.4;

const OPERATION_DEFAULTS = {
    addition: { enabled: false, count: 10, digits: 2, terms: 2, useDecimals: false, limit: 0 },
    subtraction: { enabled: false, count: 10, minuendDigits: 2, subtrahendDigits: 2, useDecimals: false, limit: 0 },
    multiplication: { enabled: false, count: 10, firstDigits: 2, secondDigits: 2 },
    division: { enabled: false, count: 10, dividendDigits: 3, divisorDigits: 1 },
    options: { printAnswers: false }
};

async function seedSettings(page, overrides) {
    const settings = Object.fromEntries(
        Object.entries(OPERATION_DEFAULTS).map(([key, value]) => [key, { ...value, ...overrides[key] }])
    );

    await page.addInitScript(([key, value]) => {
        if (!window.localStorage.getItem(key)) {
            window.localStorage.setItem(key, value);
        }
    }, [SETTINGS_STORAGE_KEY, JSON.stringify(settings)]);
}

async function createSheetForAge(page, age) {
    await page.goto('/generator');
    await page.getByRole('button', { name: `${age} лет` }).click();
    await page.getByRole('button', { name: 'Создать примеры' }).click();
    await expect(page).toHaveURL(/\/result-list$/);
}

// Digits and operators of every example, without the answer block.
async function readExamples(page) {
    await expect(page.locator('.print-page').first()).toBeVisible();

    return page.locator('.notebook-overlay-grid').allInnerTexts();
}

test.describe('generator settings', () => {
    test('asks for an operation before creating a sheet', async ({ page }) => {
        await page.goto('/generator');
        await page.getByRole('button', { name: 'Создать примеры' }).click();

        await expect(page.getByRole('alert')).toHaveText('Выберите хотя бы одну операцию');
        await expect(page).toHaveURL(/\/generator$/);

        await page.getByRole('button', { name: 'Включить сложение' }).click();
        await expect(page.getByRole('alert')).toHaveCount(0);
    });

    test('age preset fills the operations and falls back to custom settings after an edit', async ({ page }) => {
        await page.goto('/generator');
        const ageButton = (age) => page.getByRole('button', { name: `${age} лет` });
        const pressedAges = page.locator('.preset-age[aria-pressed="true"]');
        const summary = page.locator('.settings-summary');

        await expect(pressedAges).toHaveCount(0);

        await ageButton(6).click();
        await expect(summary).toContainText('20 примеров');
        await expect(summary).toContainText('Выбрано операций: 2');

        await ageButton(8).click();
        await expect(summary).toContainText('40 примеров');
        await expect(summary).toContainText('Выбрано операций: 4');

        await page.reload();
        await expect(ageButton(8)).toHaveAttribute('aria-pressed', 'true');

        await page.getByRole('button', { name: 'Выключить деление' }).click();
        await expect(pressedAges).toHaveCount(0);
        await expect(page.locator('.preset-custom')).toBeVisible();
    });

    test('keeps the example count between 1 and 100', async ({ page }) => {
        await page.goto('/generator');
        await page.getByRole('button', { name: 'Включить сложение' }).click();
        const count = page.locator('.operation-card').first().locator('input[type="number"]');

        await count.fill('7777');
        await expect(count).toHaveValue('100');

        await count.fill('');
        await count.blur();
        await expect(count).toHaveValue('1');
        await expect(page.locator('.settings-summary')).toContainText('1 пример');
    });
});

test.describe('result sheet', () => {
    test('numbers sheets continuously across operations', async ({ page }) => {
        await createSheetForAge(page, 8);

        await expect(page.locator('.notebook-title')).toHaveText(['Сложение', 'Вычитание', 'Умножение', 'Деление']);
        await expect(page.locator('.print-page-footer')).toHaveText(['Лист 1', 'Лист 2', 'Лист 3', 'Лист 4']);
        await expect(page.locator('.notebook-overlay-example-number')).toHaveCount(40);
    });

    test('keeps the same examples until new ones are requested', async ({ page }) => {
        await createSheetForAge(page, 8);
        const examples = await readExamples(page);

        await page.reload();
        expect(await readExamples(page)).toEqual(examples);

        await page.getByLabel('Печатать ответы').check();
        await expect(page.locator('.print-answers')).toHaveCount(4);
        expect(await readExamples(page)).toEqual(examples);

        await page.getByRole('button', { name: 'Другие примеры' }).click();
        await expect.poll(() => readExamples(page)).not.toEqual(examples);
    });

    test('keeps examples within the limit for the youngest preset', async ({ page }) => {
        await createSheetForAge(page, 6);
        const [addition, subtraction] = await readExamples(page);
        const sums = [...addition.matchAll(/(\d+)\s*\+\s*(\d+)/g)].map(([, a, b]) => Number(a) + Number(b));
        const minuends = [...subtraction.matchAll(/(\d+)\s*−\s*(\d+)/g)].map(([, a]) => Number(a));

        expect(sums).toHaveLength(10);
        expect(Math.max(...sums)).toBeLessThanOrEqual(10);
        expect(minuends).toHaveLength(10);
        expect(Math.max(...minuends)).toBeLessThanOrEqual(10);
    });

    test('keeps the answer block below the last example at the maximum count', async ({ page }) => {
        await seedSettings(page, {
            addition: { enabled: true, count: 100, digits: 4, useDecimals: true },
            options: { printAnswers: true }
        });
        await page.goto('/result-list');

        const lastPage = page.locator('.print-page').last();
        await expect(lastPage.locator('.print-answer-list li')).toHaveCount(100);

        const answersBox = await lastPage.locator('.print-answers').boundingBox();
        const gridBox = await lastPage.locator('.notebook-grid-frame').boundingBox();
        const cellBoxes = await lastPage.locator('.notebook-overlay-item').evaluateAll((cells) => (
            cells.map((cell) => cell.getBoundingClientRect().bottom)
        ));

        expect(Math.max(0, ...cellBoxes)).toBeLessThanOrEqual(answersBox.y + 1);
        expect(answersBox.y + answersBox.height).toBeLessThanOrEqual(gridBox.y + gridBox.height + 1);
    });

    test('ignores an oversized saved count', async ({ page }) => {
        await seedSettings(page, { addition: { enabled: true, count: 5000 } });
        await page.goto('/result-list');

        await expect(page.locator('.notebook-overlay-example-number')).toHaveCount(100);
    });

    test('shows an empty state without settings', async ({ page }) => {
        await page.goto('/result-list');

        await expect(page.getByRole('heading', { name: 'Лист ещё не создан' })).toBeVisible();
        await page.getByRole('link', { name: 'Открыть генератор' }).click();
        await expect(page).toHaveURL(/\/generator$/);
    });

    test('fits the sheet into a phone screen', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await createSheetForAge(page, 8);

        await expect.poll(async () => {
            const box = await page.locator('.print-page').first().boundingBox();
            return box.x >= 0 && box.x + box.width <= 375;
        }).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    });

    test('prints full-size sheets without site chrome', async ({ page }) => {
        await page.setViewportSize({ width: 375, height: 812 });
        await createSheetForAge(page, 8);
        await page.emulateMedia({ media: 'print' });

        await expect(page.locator('.site-header')).toBeHidden();
        await expect(page.locator('.site-footer')).toBeHidden();
        await expect(page.locator('.button-group')).toBeHidden();
        await expect(page.locator('.main-title')).toBeHidden();

        const box = await page.locator('.print-page').first().boundingBox();
        expect(box.x).toBeCloseTo(0, 0);
        expect(box.y).toBeCloseTo(0, 0);
        expect(box.width).toBeCloseTo(A4_WIDTH_PX, 0);
    });
});

test.describe('site pages', () => {
    test('opens a ready sheet from the home page age buttons', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: '9 лет' }).click();

        await expect(page).toHaveURL(/\/result-list$/);
        await expect(page.locator('.notebook-title')).toHaveText(['Сложение', 'Вычитание', 'Умножение', 'Деление']);

        await page.getByRole('button', { name: 'Назад к настройкам' }).click();
        await expect(page.getByRole('button', { name: '9 лет' })).toHaveAttribute('aria-pressed', 'true');
    });

    test('navigates between the home page, generator and info pages', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('link', { name: 'Создать лист' }).first().click();
        await expect(page).toHaveURL(/\/generator$/);

        await page.getByRole('link', { name: 'Вопросы' }).first().click();
        await expect(page.getByRole('heading', { name: 'Вопросы и ответы' })).toBeVisible();

        await page.getByRole('link', { name: 'Как подготовить лист' }).click();
        await expect(page.getByRole('heading', { name: 'Как это работает' })).toBeVisible();

        await page.goto('/no-such-page');
        await expect(page).toHaveURL(/\/$/);
    });
});
