# Operation Behavior

This document describes operation-specific UI and generator rules. Keep Russian UI labels in source files unless a task explicitly asks to rewrite them.

## Addition

Addition examples use the notebook grid through `NotebookGrid`.

Settings:

- `count`: number of examples.
- `digits`: digit count for generated integer parts.
- `terms`: number of addends.
- `useDecimals`: when enabled, addends are generated as decimal strings with a comma separator.

Decimal addition rules:

- Generated decimal values use `,`, not `.`.
- Decimal values currently use two generated fractional digits.
- Trailing zeroes in the fractional part are not rendered in the grid.
- The comma is not a separate grid column.
- The comma is rendered as an overlay attached to the last integer digit cell.
- Placement aligns integer parts and fractional parts separately so commas line up vertically.

Example:

```txt
  426,3
+ 607,3
```

The `6` and `7` cells carry `decimalSeparatorAfter: true`, and both cells must have the same column.

## Subtraction

Subtraction examples use the notebook grid through `NotebookGrid`.

Settings:

- `count`: number of examples.
- `minuendDigits`: digit count for the minuend.
- `subtrahendDigits`: digit count for the subtrahend.

UI constraint:

- The subtrahend digit selector must disable options greater than `minuendDigits`.
- If `minuendDigits` is lowered below the current `subtrahendDigits`, clamp `subtrahendDigits` to the new `minuendDigits`.
- Do not show an error for this case; impossible choices should be unavailable.

Generator behavior:

- The generator still guarantees non-negative subtraction examples.
- If randomly generated values would produce a negative result, it swaps the values.

## Multiplication

Multiplication examples use the notebook grid through `NotebookGrid`.

Settings:

- `count`: number of examples.
- `firstDigits`: digit count for the first factor.
- `secondDigits`: digit count for the second factor.
- `maxResult`: optional product ceiling. `0` means no ceiling.

Generator behavior:

- `maxResult` is enforced when non-zero.
- If the chosen digit ranges cannot produce any valid product within `maxResult`, the generator throws `RangeError`.

Grid behavior:

- Multiplication currently uses the same vertical two-number placement model as addition/subtraction.
- It renders the `×` operator and answer line.
- It does not yet render intermediate multiplication rows.

## Division

Division examples still use the operation-specific `DivisionExample` component.

Settings:

- `count`: number of examples.
- `dividendDigits`: digit count for the dividend.
- `divisorDigits`: digit count for the divisor.

Generator behavior:

- Generated examples divide evenly.
- The generator computes a feasible quotient range for the selected divisor.
- It should avoid retry loops for normal valid ranges.
- It throws `RangeError` for impossible digit combinations.

## Test Expectations

Generator changes belong in `src/generators/generators.test.js`.

Notebook placement changes belong in `src/features/notebookGrid/notebookGrid.test.js`.

After behavior changes, run:

```bash
npm.cmd test
npm.cmd run build
```
