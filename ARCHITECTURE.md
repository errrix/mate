# Architecture Notes

## Purpose

The app generates math exercises for students and formats printable examples on notebook-style A4 grids. The user chooses operations, numeric ranges, and the print-grid render mode.

## Runtime Stack

- React 18
- Vite 5
- Vitest
- Plain CSS imported from components
- No router, backend, state library, or TypeScript

## Data Flow

1. `SettingsScreen` owns the local `settings` object, including operation options and `gridMode`.
2. `SettingsScreen` passes settings to `App` on generate.
3. `App` stores `gridMode`, calls enabled generators, stores generated examples, and switches to the examples screen.
4. `ExamplesScreen` groups examples by `type`.
5. Addition/subtraction/multiplication groups render through `NotebookGrid`.
6. Division groups render through the existing operation-specific component.
7. Printing is triggered with `window.print()`.

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
- `pageModel.js`: physical page/grid model. Current grid is full-page A4 with `5mm` cells, `42` columns and `59` rows.
- `placement.js`: pure placement logic. It maps examples to grid cells with `{ row, col, kind, value }`.
- `NotebookGrid.jsx`: feature entrypoint. It builds placement and chooses a renderer.
- `renderers/DomNotebookGrid.jsx`: baseline renderer with real DOM cells.
- `renderers/CssNotebookGrid.jsx`: explicit CSS line layer plus CSS Grid digit overlay.
- `renderers/SvgNotebookGrid.jsx`: SVG grid lines and text.

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

### Renderers

All three renderers consume the same `cells` array:

- DOM renders all physical cells and places content inside matching cells.
- CSS draws explicit line layers and overlays items with CSS Grid.
- SVG draws the full grid and places text with SVG coordinates.

Decimal comma styling has renderer-specific mechanics, but renderer-specific code must only interpret the shared `decimalSeparatorAfter` flag. It must not re-compute number alignment.

## Generator Architecture

Generators live in `src/generators`.

- `numberUtils.js` owns digit ranges and random integer helpers.
- Addition/subtraction/multiplication/division generators all use shared helpers.
- Addition can generate decimal strings through the shared decimal helper.
- Multiplication throws `RangeError` when `maxResult` is impossible.
- Division computes a valid quotient range for the selected divisor and does not use retry loops.

Operation-specific behavior is documented in `docs/OPERATIONS.md`.

## Settings Architecture

`SettingsScreen` currently owns one local `settings` object. It contains root settings such as `gridMode` and nested settings for each operation.

The form is still hand-written. When adding controls, keep the current state shape explicit and avoid introducing a second source of truth.

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

- `SettingsScreen` is still a large hand-written form and should be made config-driven.
- `AdditionExample` and `SubtractionExample` appear obsolete after the notebook grid refactor; confirm before deleting.
- `MultiplicationExample` may also become obsolete now that multiplication uses `NotebookGrid`; confirm before deleting.
- Print output depends on browser print behavior and printer settings, so visual checks remain necessary for grid changes.
- User-facing validation still relies partly on `alert()` and should be improved later.

## Documentation Map

- `AGENTS.md`: concise working instructions for coding agents.
- `ARCHITECTURE.md`: system-level architecture and current risks.
- `docs/OPERATIONS.md`: operation-specific settings, generator rules, and grid expectations.
- `src/features/notebookGrid/README.md`: detailed print-grid and renderer constraints.
