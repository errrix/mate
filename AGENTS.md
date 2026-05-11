# Agent Instructions

This project is a Vite + React web app for generating printable math exercises in Russian.

## Project Overview

- Entry point: `src/main.jsx`
- Main app state and screen switching: `src/App.jsx`
- Settings UI: `src/components/SettingsScreen.jsx`
- Generated examples screen: `src/components/ExamplesScreen.jsx`
- App-level store and settings persistence: `src/store/exerciseStore.jsx`
- Printable notebook grid feature: `src/features/notebookGrid`
- Math generation logic: `src/generators/*Generator.js`
- Shared generator utilities: `src/generators/numberUtils.js`
- Operation-specific behavior notes: `docs/OPERATIONS.md`
- Tests: `src/**/*.test.js`
- Styles: plain CSS imports, not CSS Modules

## Commands

Use `npm.cmd` on Windows PowerShell if `npm` is blocked by Execution Policy.

```bash
npm.cmd install
npm.cmd test
npm.cmd run build
npm.cmd run dev
```

After code changes, run both:

```bash
npm.cmd test
npm.cmd run build
```

`vite build` creates `dist/`; remove it before committing because build output is ignored and should not be part of normal working changes.

## Working Rules

- Do not edit `node_modules` or committed build output.
- Keep source files encoded as UTF-8.
- Preserve Russian UI text unless the task asks to rewrite it.
- Keep changes small and focused.
- Keep user input settings in the shared store and persisted to `localStorage`.
- For generator changes, update or add Vitest coverage.
- For print layout changes, check browser preview when practical and keep placement logic renderer-independent.
- Do not duplicate random/range helpers inside generators; use `src/generators/numberUtils.js`.

## Print Grid Notes

Addition, subtraction, and multiplication use `src/features/notebookGrid`.

- `pageModel.js` defines the physical A4 grid model.
- `placement.js` converts examples into `{ row, col, kind, value }` cells.
- `NotebookGrid.jsx` builds placement and renders the CSS grid.
- `src/features/notebookGrid/README.md` documents print-specific constraints.
- Current renderer: `css`, with explicit CSS line layers plus overlayed digits.

Placement output must stay renderer-independent. If a print bug is caused by coordinates, fix `placement.js`; if coordinates are correct, fix the CSS renderer or print styles.

Decimal addition must align integer and fractional parts separately so commas stay in one column. Decimal comma rendering is intentionally handled as an overlay on the last integer digit cell.

## Current Priorities

1. Refactor `SettingsScreen` into config-driven controls.
2. Remove dead components if `AdditionExample`, `SubtractionExample`, and `MultiplicationExample` remain unused.
3. Improve user-facing validation/errors for impossible settings.
4. Keep print grid changes isolated and test placement logic directly.
