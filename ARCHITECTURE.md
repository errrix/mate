# Architecture Notes

## Purpose

The app generates math exercises for students and formats addition/subtraction examples on printable notebook-style A4 grids. The user chooses operations, numeric ranges, and the print-grid render mode.

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
5. Addition/subtraction groups render through `NotebookGrid`.
6. Multiplication/division groups render through their existing operation-specific components.
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

## Generator Architecture

Generators live in `src/generators`.

- `numberUtils.js` owns digit ranges and random integer helpers.
- Addition/subtraction/multiplication/division generators all use shared helpers.
- Multiplication throws `RangeError` when `maxResult` is impossible.
- Division computes a valid quotient range for the selected divisor and does not use retry loops.

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
- Print output depends on browser print behavior and printer settings, so visual checks remain necessary for grid changes.
- User-facing validation still relies partly on `alert()` and should be improved later.
