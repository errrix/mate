# Notebook Grid Feature

This feature renders printable notebook-style grids for addition, subtraction, and multiplication.

## Core Rule

The renderer must use the shared placement model.

Do not calculate digit positions inside the renderer. It only draws the cells it receives from `buildNotebookPlacement`.

## Page Model

`pageModel.js` defines the physical print grid:

- A4 page: `210mm x 297mm`
- Cell size: `7mm`
- Margins in the app model: `0mm`
- Usable grid: `30` columns x `42` rows
- Actual grid height: `294mm`; A4 leaves a physical `3mm` remainder because `297` is not divisible by `7`

The CSS print rule uses `@page { margin: 0; size: A4; }`. Printer hardware may still add non-printable margins.

## Placement Model

`placement.js` owns all example positioning.

Examples are packed left to right by their actual cell width inside a content area with `2` empty cells of padding on the left and right page edges. Neighboring examples keep at least `2` empty cells between them. If the next example would exceed the content area with that minimum gap, placement moves it to the next row band and keeps the digits aligned inside that new band. Remaining horizontal space is distributed across gaps in non-final rows so they do not leave a large unused area on the right. The final row is left-aligned with the minimum gap instead of being centered or stretched.

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

Cell coordinates are zero-based. `row` and `col` map directly to the `7mm` grid.

Cell kinds:

- `digit`: a single digit.
- `operator`: `+`, `−`, or `×`.
- `line`: one cell segment of the answer line.

The answer line belongs on the top edge of its row.

## Rendering

`NotebookGrid.jsx` uses `renderers/CssNotebookGrid.jsx`.

The renderer draws grid lines as explicit positioned CSS elements, then overlays digits with CSS Grid. It intentionally does not rely on `background-image`, because Chrome print preview can hide backgrounds unless background graphics are enabled.

When fixing layout bugs:

1. Check whether the bug is in shared placement or CSS rendering.
2. If coordinates are wrong, fix `placement.js`.
3. If coordinates are correct but output is wrong, fix `CssNotebookGrid.jsx` or `ExamplesScreen.css`.
4. Add or update a placement test when the fix changes positioning rules.

## Print-Specific Notes

- Browser preview is necessary for this feature. Unit tests cannot validate printer rasterization.
- CSS background printing is unreliable; keep visible printed grid lines as explicit elements.
- Avoid viewport-based font sizes or dimensions in print mode.
- Avoid scaling in print mode. If content does not fit one page, report overflow instead of shrinking.
- Keep answer lines aligned to the top edge of the target grid row.

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

Generate examples and check the printable grid preview.
