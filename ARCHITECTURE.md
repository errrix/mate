# Architecture Notes

## Purpose

The app generates math exercises for students and formats printable examples on notebook-style A4 grids. The user chooses operations, numeric ranges, and operation-specific options.

## Runtime Stack

- React 19
- Vite 8
- React Router
- Vitest
- Plain CSS imported from components
- No backend, state library, or TypeScript

## Data Flow

1. `ExerciseStoreProvider` owns shared `settings`.
2. `App` renders the shared site shell (`SiteHeader`, routed page content, `SiteFooter`).
3. `SettingsScreen` passes settings to `App` on generate.
4. `App` verifies that at least one operation is enabled and navigates to `/result-list`.
5. `ExamplesScreen` reads settings from the shared store, generates examples for the current settings, and groups them by `type`.
6. Addition/subtraction/multiplication groups render through `NotebookGrid`.
7. Division groups render through the existing operation-specific component.
8. Printing is triggered with `window.print()`.

## Client Store

`src/store/exerciseStore.jsx` provides the app-level store through React context.

- `settings`: operation settings used by the generator form.
- `setSettings`: updates form input state.

Settings are persisted in `localStorage` under `math-examples-generator.settings`. Saved settings are merged with defaults on load so newly added fields can fall back to default values.

Generated examples are not stored in `localStorage`. `/result-list` generates the current sheet from the persisted settings, so direct result-page loads work without storing derived example data.

## Routing

The app uses `react-router-dom` with browser routing.

- `/`: home page with product intro and worksheet preview.
- `/generator`: settings form.
- `/result-list`: generated printable examples.
- `/faq`: FAQ content through `InfoPage`.
- `/how-it-works`: usage explanation through `InfoPage`.
- Unknown paths redirect to `/`.

`App.jsx` wraps every route in the same `.container` and shared header/footer. Header and footer are hidden in print mode so the generated A4 output can use the full printed page.

## Layout and Styling

The app uses plain CSS imports. Shared page shell values live in `src/index.css` as CSS custom properties:

- `--site-shell-max-width`: shared app container width, currently `1280px`.
- `--site-content-max-width`: constrained content width for text-heavy pages.
- `--site-readable-max-width`: readable line length for paragraph copy.
- `--site-page-gutter`: responsive outer gutter.

`src/App.css` owns the shared `.container` shell. Route-specific pages should use this shell instead of introducing their own app-level width. Page components can still constrain their own internal content when needed.

`SiteHeader` and `SiteFooter` provide common navigation and footer links across all routes. Do not duplicate header navigation inside page components.

## Example Shapes

Addition and subtraction:

```js
{
  numbers: [12, 34],
  operator: "+",
  type: "addition"
}
```

Decimal addition values are stored as strings because they need display-specific formatting:

```js
{
  numbers: ["12,37", "4,5"],
  operator: "+",
  type: "addition"
}
```

Multiplication:

```js
{
  numbers: [12, 3],
  operator: "×",
  type: "multiplication"
}
```

Division:

```js
{
  dividend: 84,
  divisor: 7,
  type: "division"
}
```

## Print Grid Architecture

`src/features/notebookGrid` owns the printable grid.

- `README.md`: feature-specific print rules and renderer guidance.
- `pageModel.js`: physical page/grid model. Current grid is full-page A4 with `7mm` cells, `30` columns and `42` rows.
- `placement.js`: pure placement logic. It maps examples to grid cells with `{ row, col, kind, value }`.
- `NotebookGrid.jsx`: feature entrypoint. It builds placement and renders the CSS grid.
- `renderers/CssNotebookGrid.jsx`: explicit CSS line layer plus CSS Grid digit overlay.

Renderer implementations should not decide where digits go. Placement must stay renderer-independent.

The grid currently supports addition, subtraction, and multiplication. Division has a separate visual component and is not part of the shared grid yet.

### Placement Details

`placement.js` converts every printable character into a token-like cell description before renderers see it.

Whole numbers are right-aligned by digit count.

Decimal numbers are split into:

- integer tokens,
- fractional tokens,
- a `decimalSeparatorAfter` marker on the last integer token.

This matters because the decimal comma must line up vertically across the numbers in one example. The comma is rendered as an overlay on the final integer digit cell, not as its own grid column. Fractional digits begin in the next grid column.

Trailing zeroes in the fractional part are removed for display. After trimming, placement still pads the fractional side so examples keep consistent decimal alignment.

The answer line spans `parsed.maxLength` cells. For decimal examples this includes integer and fractional digit columns, but not a separate comma column.

Examples are packed into row bands by actual cell width. Placement reserves `2` empty cells on the left and right page edges, keeps at least `2` empty cells between neighboring examples, distributes extra horizontal space across non-final row gaps, and left-aligns the final row with the minimum gap.

### Renderer

The CSS renderer consumes the shared `cells` array from placement.

- It draws explicit line layers instead of relying on CSS backgrounds, because browser print preview can omit backgrounds unless background graphics are enabled.
- It overlays digits, operators, and answer-line segments with CSS Grid.

Decimal comma styling is handled by interpreting the shared `decimalSeparatorAfter` flag. The renderer must not re-compute number alignment.

## Generator Architecture

Generators live in `src/generators`.

- `numberUtils.js` owns digit ranges and random integer helpers.
- Addition/subtraction/multiplication/division generators all use shared helpers.
- Addition can generate decimal strings through the shared decimal helper.
- Multiplication throws `RangeError` when `maxResult` is impossible.
- Division computes a valid quotient range for the selected divisor and does not use retry loops.

Operation-specific behavior is documented in `docs/OPERATIONS.md`.

## Settings Architecture

`SettingsScreen` reads and writes the shared `settings` object from `ExerciseStoreProvider`. The object contains nested settings for each operation.

The form is currently a compact card-based UI. Operation controls are still hand-written. When adding controls, keep the current state shape explicit and avoid introducing a second source of truth.

The age preset selector in `SettingsScreen` is UI-only. It stores the selected age in local component state, changes the competency hint text, and does not mutate operation settings or persist to `localStorage`. The reset button restores `DEFAULT_SETTINGS` and resets the selected age to `6`.

Subtraction uses disabled select options to prevent impossible digit ranges. The UI should make invalid combinations unavailable instead of showing an error for this case.

The settings screen is a good candidate for a config-driven refactor, but that should be done separately from operation behavior changes.

## Tests

- Generator behavior is covered by `src/generators/generators.test.js`.
- Notebook page model and placement are covered by `src/features/notebookGrid/notebookGrid.test.js`.
- Required verification after meaningful changes:

```bash
npm.cmd test
npm.cmd run build
```

## Current Risks

- `SettingsScreen` operation controls are still hand-written and should be made config-driven.
- The age preset selector is UI-only; future business logic must define how presets map to operation settings before wiring it into the store.
- `AdditionExample`, `SubtractionExample`, and `MultiplicationExample` are currently unused after the notebook grid refactor; confirm before deleting.
- Print output depends on browser print behavior and printer settings, so visual checks remain necessary for grid changes.
- User-facing validation still relies partly on `alert()` and should be improved later.

## Documentation Map

- `AGENTS.md`: concise working instructions for coding agents.
- `ARCHITECTURE.md`: system-level architecture and current risks.
- `docs/OPERATIONS.md`: operation-specific settings, generator rules, and grid expectations.
- `src/features/notebookGrid/README.md`: detailed print-grid and renderer constraints.
