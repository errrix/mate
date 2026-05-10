# Notebook Grid Feature

This feature renders printable notebook-style grids for addition, subtraction, and multiplication.

## Core Rule

All render modes must use the same placement model.

Do not calculate digit positions inside a renderer. Renderers only draw the cells they receive from `buildNotebookPlacement`.

## Page Model

`pageModel.js` defines the physical print grid:

- A4 page: `210mm x 297mm`
- Cell size: `5mm`
- Margins in the app model: `0mm`
- Usable grid: `42` columns x `59` rows
- Actual grid height: `295mm`; A4 leaves a physical `2mm` remainder because `297` is not divisible by `5`

The CSS print rule uses `@page { margin: 0; size: A4; }`. Printer hardware may still add non-printable margins.

## Placement Model

`placement.js` owns all example positioning.

Input:

```js
buildNotebookPlacement(items, operator)
```

Output:

```js
{
  page,
  layout,
  cells: [
    { row: 1, col: 6, kind: "digit", value: "1" },
    { row: 2, col: 5, kind: "operator", value: "+" },
    { row: 3, col: 6, kind: "line", value: "" }
  ],
  overflow,
  requiredRows,
  requiredCols
}
```

Cell coordinates are zero-based. `row` and `col` map directly to the `5mm` grid.

Cell kinds:

- `digit`: a single digit.
- `operator`: `+`, `−`, or `×`.
- `line`: one cell segment of the answer line.

The answer line belongs on the top edge of its row. This keeps DOM, CSS, and SVG output aligned.

## Render Modes

`NotebookGrid.jsx` selects a renderer by `gridMode`.

- `dom`: draws every grid cell as a DOM element. This is the baseline mode.
- `css`: draws grid lines as explicit positioned CSS elements, then overlays digits with CSS Grid. It intentionally does not rely on `background-image`, because Chrome print preview can hide backgrounds unless background graphics are enabled.
- `svg`: draws grid lines, answer lines, and text inside one SVG.

When fixing layout bugs:

1. Check whether the bug is in shared placement or a renderer.
2. If all modes are wrong, fix `placement.js`.
3. If only one mode is wrong, fix only that renderer.
4. Add or update a placement test when the fix changes positioning rules.

## Print-Specific Notes

- Browser preview is necessary for this feature. Unit tests cannot validate printer rasterization.
- CSS background printing is unreliable; prefer explicit elements or SVG for visible printed grid lines.
- Avoid viewport-based font sizes or dimensions in print mode.
- Avoid scaling in print mode. If content does not fit one page, report overflow instead of shrinking.
- Keep answer lines aligned to the same edge across all modes.

## Verification

Run:

```bash
npm.cmd test
npm.cmd run build
```

For visual checks, start the app:

```bash
npm.cmd run dev
```

Then compare `DOM ячейки`, `CSS фон + цифры`, and `SVG лист` from the settings screen.
