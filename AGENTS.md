# Agent Instructions

This project is a Vite + React web app for generating printable math exercises in Russian.

## Project Overview

- Entry point: `src/main.jsx`
- Main app state and screen switching: `src/App.jsx`
- Settings UI: `src/components/SettingsScreen.jsx`
- Generated examples UI and print layout: `src/components/ExamplesScreen.jsx`
- Operation-specific renderers: `src/components/*Example.jsx`
- Math generation logic: `src/generators/*Generator.js`
- Global styles: `src/index.css`, `src/App.css`, and component CSS files

## Commands

Use `npm.cmd` on Windows PowerShell if `npm` is blocked by Execution Policy.

```bash
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

There is no test suite yet. For now, `npm.cmd run build` is the required verification step after code changes.

## Working Rules

- Do not edit `node_modules` or committed build output.
- Keep source files encoded as UTF-8.
- Preserve Russian UI text unless the task asks to rewrite it.
- Keep changes small and focused.
- For generator changes, verify the math constraints directly with small Node scripts or tests.
- For UI/layout changes, check both screen layout and print behavior when practical.
- Prefer adding tests before or alongside non-trivial generator fixes.

## Known Issues

- Addition/subtraction notebook grid currently computes digit positions in a way that can reverse displayed digits.
- Multiplication `maxResult` is not guaranteed when the selected digit ranges make the limit impossible.
- Division generation retries by decrementing the loop counter and has no explicit attempt limit.
- README mentions CSS Modules, but the project uses regular global CSS imports.

## Suggested Task Order

1. Add a small test setup for generator functions.
2. Fix notebook-grid digit ordering.
3. Make multiplication constraints deterministic and handle impossible settings clearly.
4. Make division generation bounded and predictable.
5. Improve print layout only after functional behavior is covered.
