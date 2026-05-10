# Agent Instructions

This project is a Vite + React web app for generating printable math exercises in Russian.

## Project Overview

- Entry point: `src/main.jsx`
- Main app state and screen switching: `src/App.jsx`
- Settings UI: `src/components/SettingsScreen.jsx`
- Generated examples screen: `src/components/ExamplesScreen.jsx`
- Printable notebook grid feature: `src/features/notebookGrid`
- Math generation logic: `src/generators/*Generator.js`
- Shared generator utilities: `src/generators/numberUtils.js`
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
- For generator changes, update or add Vitest coverage.
- For print layout changes, check browser preview when practical and keep DOM/CSS/SVG grid modes using the same placement model.
- Do not duplicate random/range helpers inside generators; use `src/generators/numberUtils.js`.

## Print Grid Notes

Addition and subtraction use `src/features/notebookGrid`.

- `pageModel.js` defines the physical A4 grid model.
- `placement.js` converts examples into `{ row, col, kind, value }` cells.
- `NotebookGrid.jsx` chooses a renderer by mode.
- `src/features/notebookGrid/README.md` documents print-specific constraints.
- Render modes:
  - `dom`: DOM cells baseline.
  - `css`: explicit CSS line layer plus overlayed digits.
  - `svg`: SVG lines and text.

All render modes must share the same placement output. Do not fix only one renderer unless the bug is renderer-specific.

## Current Priorities

1. Refactor `SettingsScreen` into config-driven controls.
2. Remove dead components if `AdditionExample` and `SubtractionExample` remain unused.
3. Improve user-facing validation/errors for impossible settings.
4. Keep print grid changes isolated and test placement logic directly.
