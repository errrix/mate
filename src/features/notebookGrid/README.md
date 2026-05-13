# Notebook Grid Feature

This feature renders printable notebook-style grids for addition, subtraction, multiplication, and division.

## Core Rule

The renderer must use the shared placement model.

Do not calculate digit positions inside the renderer. It only draws the cells it receives from `buildNotebookPlacement`.

## Page Model

`pageModel.js` defines the physical print model:

- A4 page: `210mm x 297mm`
- Cell size: `7mm`
- Margins in the app model: `0mm`
- Header area: `24mm`, including name/date fields and a `7mm` gap before the grid
- Footer area: `14mm`, used for the sheet number
- Usable grid: `30` columns x `37` rows
- Actual grid height: `259mm`

The CSS print rule uses `@page { margin: 0; size: A4; }`. Printer hardware may still add non-printable margins.

## Placement Model

`placement.js` owns all example positioning, pagination, example numbering, and optional answer data.

Examples are packed left to right by their actual cell width inside a content area with `2` empty cells of padding on the left and right page edges. Neighboring examples keep at least `2` empty cells between them and distributed rows cap that gap at `3` cells. If the next example would exceed the content area with the minimum gap, placement moves it to the next row band and keeps the digits aligned inside that new band. Remaining horizontal space is distributed across gaps in non-final rows up to that cap. The final row is left-aligned with the minimum gap instead of being centered or stretched.

Input:

```js
buildNotebookPlacement(items, operator, { printAnswers: false })
```

Output:

```js
{
  page,
  layout,
  options,
  pages: [
    {
      number: 1,
      cells: [
        { row: 1, col: 4, kind: "example-number", value: "1." },
        { row: 1, col: 6, kind: "digit", value: "1" },
        { row: 2, col: 5, kind: "operator", value: "+" },
        { row: 3, col: 6, kind: "line", value: "" }
      ],
      answers: []
    }
  ],
  answers: [],
  cells,
  overflow,
  requiredRows,
  requiredCols
}
```

Cell coordinates are zero-based. `row` and `col` map directly to the `7mm` grid. Page coordinates are local to each printed sheet.

`cells` is a flattened compatibility view across all pages. New rendering work should prefer `pages[*].cells`.

Cell kinds:

- `digit`: a single digit.
- `operator`: an operation sign or equals sign.
- `line`: one cell segment of a vertical-form answer line.
- `vertical-line`: one cell segment of a long-division separator.
- `example-number`: the printed example number placed before the example.

The answer line belongs on the top edge of its row.

Small integer examples are rendered horizontally instead of vertically:

- one-digit addition, such as `4 + 7 =`
- one-digit multiplication, such as `6 x 8 =`
- subtraction with one- or two-digit operands when at least one operand is one digit, such as `8 - 3 =` or `12 - 7 =`

Multiplication examples reserve blank rows below the visible answer line for student work. A one-digit multiplier reserves one answer row. Multi-digit multipliers reserve one row per multiplier digit plus one final result row, then one extra blank row before the next example band.

Division examples render a long-division corner on the shared grid. The dividend is placed left of a vertical separator, the divisor is placed to the right, and a horizontal answer line marks the blank quotient area. Placement reserves rows for student work from the quotient digit count, then one extra blank row before the next example band.

When examples do not fit on one sheet, placement creates additional `pages` instead of scaling the grid. `overflow` is reserved for content that cannot fit within one page row band or exceeds available columns.

When `printAnswers` is true, placement reserves `layout.answerRows` at the bottom of the last page and attaches `answers` to that page. The renderer draws a dashed cut line and a compact answer list in that reserved area.

## Rendering

`NotebookGrid.jsx` uses `renderers/CssNotebookGrid.jsx`.

The renderer draws grid lines as explicit positioned CSS elements, then overlays digits with CSS Grid. It intentionally does not rely on `background-image`, because Chrome print preview can hide backgrounds unless background graphics are enabled.

When fixing layout bugs:

1. Check whether the bug is in shared placement or CSS rendering.
2. If coordinates are wrong, fix `placement.js`.
3. If coordinates are correct but output is wrong, fix `CssNotebookGrid.jsx` or `ExamplesScreen.css`.
4. Add or update a placement test when the fix changes positioning rules.
5. Add or update a Playwright visual snapshot when the printed sheet can regress visually.

## Print-Specific Notes

- Browser preview is necessary for this feature. Unit tests cannot validate printer rasterization.
- CSS background printing is unreliable; keep visible printed grid lines as explicit elements.
- Avoid viewport-based font sizes or dimensions in print mode.
- Avoid scaling in print mode. If content does not fit one page, paginate instead of shrinking.
- Keep answer lines aligned to the top edge of the target grid row.
- Global print resets can remove padding. Any print-only header/footer spacing must be explicitly restored inside `@media print`.

## Verification

Run:

```bash
npm.cmd test
npm.cmd run test:e2e
npm.cmd run build
```

For manual visual checks, start the app:

```bash
npm.cmd run dev
```

Then open the generated examples screen or one of the dev-only visual routes documented in `docs/TESTING.md`.
