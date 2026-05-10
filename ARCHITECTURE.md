# Architecture Notes

## Purpose

The app generates math exercises for students and formats them for printing. The user chooses operations and numeric ranges, then the app renders printable examples.

## Runtime Stack

- React 18
- Vite 5
- Plain CSS imported from components
- No router, backend, state library, or test runner yet

## Data Flow

1. `SettingsScreen` owns a local `settings` object with operation-specific options.
2. When the user clicks generate, `SettingsScreen` passes settings to `App`.
3. `App` calls enabled operation generators from `src/generators`.
4. The resulting examples are stored in `App` state and passed to `ExamplesScreen`.
5. `ExamplesScreen` groups examples by `type` and renders either:
   - notebook-grid layouts for addition and subtraction;
   - operation-specific components for multiplication and division.
6. Printing is triggered with `window.print()`.

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
  operator: "x",
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

## Important Files

- `src/App.jsx`: coordinates generation and screen changes.
- `src/components/SettingsScreen.jsx`: controls available settings and default values.
- `src/components/ExamplesScreen.jsx`: contains the densest layout logic, especially printable notebook grids.
- `src/generators/additionGenerator.js`: random addends by digit count.
- `src/generators/subtractionGenerator.js`: random minuend/subtrahend with non-negative result.
- `src/generators/multiplicationGenerator.js`: random factors with optional maximum product.
- `src/generators/divisionGenerator.js`: integer division examples by generating divisor and quotient.

## Current Risks

- Generator behavior is not covered by automated tests.
- Print CSS is important to the product but is easy to regress without visual checks.
- Some layout math in `ExamplesScreen` is complex enough that it should be extracted or tested once behavior is corrected.
- Settings validation mostly relies on HTML controls; generator functions should still be defensive.

## Recommended Next Steps

Create a lightweight test setup, then fix one generator/layout issue at a time with a build check after each meaningful change.
