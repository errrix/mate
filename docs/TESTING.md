# Testing

This project uses two test layers:

- Vitest unit tests for generator and placement logic.
- Playwright visual regression tests for rendered notebook grid output.

Use `npm.cmd` on Windows PowerShell if plain `npm` is blocked by Execution Policy.

## Unit Tests

Run fast unit tests:

```bash
npm.cmd test
```

Vitest is configured to read only `src/**/*.test.js`. Keep placement behavior covered here because these tests are faster and easier to debug than screenshots.

## Visual Tests

Run Playwright screenshot comparisons:

```bash
npm.cmd run test:e2e
```

Visual tests live in `e2e/`. Baseline screenshots live next to the spec in `e2e/*-snapshots/` and should be committed when the expected layout changes.

The current visual tests render dev-only routes:

```text
/__visual-tests/notebook-grid/small-horizontal
/__visual-tests/notebook-grid/vertical-arithmetic
```

These routes are available only in Vite dev mode through `import.meta.env.DEV`; they are not included as normal production routes.

## Updating Screenshots

Do not use the broad update command as a routine workflow:

```bash
npm.cmd run test:e2e:update
```

That updates every Playwright snapshot and forces you to re-review every visual case. Use it only for intentional broad changes, such as a renderer-wide page size, font, or browser baseline change.

For normal work, update one test by name:

```bash
npx.cmd playwright test -g "renders decimal addition alignment" --update-snapshots
```

Recommended workflow:

1. Add or change a fixture in `src/features/notebookGrid/NotebookGridVisualTestPage.jsx`.
2. Add or change the matching test in `e2e/notebook-grid.visual.spec.js`.
3. Open the dev route manually and check the layout.
4. Update only that test snapshot with `npx.cmd playwright test -g "test name" --update-snapshots`.
5. Run `npm.cmd run test:e2e` to verify the committed baseline.

If an existing visual test fails, inspect the generated files in `test-results/`: actual, expected, and diff. If the change is intentional, update only the affected test snapshot with `-g`.

## What To Commit

Commit:

- `e2e/**/*.spec.js`
- `e2e/*-snapshots/*.png`
- test fixtures and config files

Do not commit:

- `test-results/`
- `playwright-report/`
- `dist/`

## Full Check Before Commit

```bash
npm.cmd test
npm.cmd run test:e2e
npm.cmd run build
```

After `npm.cmd run build`, remove `dist/` before committing.
