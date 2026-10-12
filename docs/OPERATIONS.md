# Operation Behavior

This document describes operation-specific UI and generator rules. Keep Russian UI labels in source files unless a task explicitly asks to rewrite them.

## Addition

Addition examples use the notebook grid through `NotebookGrid`.

Settings:

- `count`: number of examples.
- `digits`: digit count for generated integer parts.
- `limit`: `0`, `10` or `20`. A non-zero limit replaces `digits` and decimals: terms are positive and their total stays within the limit.
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
- `useDecimals`: when enabled, minuend and subtrahend are generated as decimal strings with a comma separator.

UI constraint:

- The subtrahend digit selector must disable options greater than `minuendDigits`.
- If `minuendDigits` is lowered below the current `subtrahendDigits`, clamp `subtrahendDigits` to the new `minuendDigits`.
- Do not show an error for this case; impossible choices should be unavailable.

`limit` (`0`, `10` or `20`) replaces both digit settings and decimals: the minuend stays within the limit.

Generator behavior:

- The generator still guarantees non-negative subtraction examples.
- Examples with a zero answer are re-rolled.
- If randomly generated values would produce a negative result, it swaps the values.
- Decimal subtraction uses the same comma-separated display format as decimal addition.

## Multiplication

Multiplication examples use the notebook grid through `NotebookGrid`.

Settings:

- `count`: number of examples.
- `firstDigits`: digit count for the first factor.
- `secondDigits`: digit count for the second factor.

UI constraint:

- The second factor digit selector must disable options greater than `firstDigits`.
- If `firstDigits` is lowered below the current `secondDigits`, clamp `secondDigits` to the new `firstDigits`.
- Do not show an error for this case; impossible choices should be unavailable.

Generator behavior:

- The generator creates factors within the selected digit ranges.

Grid behavior:

- Multiplication currently uses the same vertical two-number placement model as addition/subtraction.
- It renders the `×` operator and answer line.
- It does not yet render intermediate multiplication rows.
- Placement reserves blank rows for intermediate multiplication work so the next example does not overlap the student's solution.

## Division

Division examples use the notebook grid through `NotebookGrid`.

Settings:

- `count`: number of examples.
- `dividendDigits`: digit count for the dividend.
- `divisorDigits`: digit count for the divisor.

Generator behavior:

- Generated examples divide evenly.
- The divisor is never 1, and a quotient of 1 is used only when the digit ranges allow nothing else.
- The generator computes a feasible quotient range for the selected divisor.
- It should avoid retry loops for normal valid ranges.
- It throws `RangeError` for impossible digit combinations.

Grid behavior:

- Division renders a long-division corner with the dividend on the left and the divisor on the right.
- The quotient is not printed; the grid leaves space under the horizontal answer line.
- Placement reserves work rows based on quotient digit count and one extra blank row before the next example band.

## Age Presets

`src/store/agePresets.js` maps the "Готовые настройки по возрасту" buttons (generator and home page quick start) to operation settings. Choosing an age enables the listed operations with these digit settings, disables the rest and keeps `options`.

| Age | Addition | Subtraction | Multiplication | Division |
| --- | --- | --- | --- | --- |
| 6 | within 10, 2 terms | within 10 | off | off |
| 7 | within 20, 2 terms | within 20 | off | off |
| 8 | 2-digit, 2 terms | 2-digit − 2-digit | 1-digit × 1-digit | 2-digit ÷ 1-digit |
| 9 | 3-digit, 2 terms | 3-digit − 3-digit | 2-digit × 1-digit | 3-digit ÷ 1-digit |
| 10 | 3-digit decimals, 2 terms | 4-digit − 3-digit | 3-digit × 2-digit | 4-digit ÷ 2-digit |

The pressed button is derived from the current settings: an age is highlighted only while the settings match that preset exactly, otherwise the generator shows "свои настройки".

Each enabled operation card also shows one sample example built from its current settings.

## Test Expectations

Generator changes belong in `src/generators/generators.test.js`.

Notebook placement changes belong in `src/features/notebookGrid/notebookGrid.test.js`.

After behavior changes, run:

```bash
npm.cmd test
npm.cmd run build
```
