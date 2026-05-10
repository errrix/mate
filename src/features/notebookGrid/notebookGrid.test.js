import { describe, expect, test } from 'vitest';
import { createPageModel } from './pageModel';
import { buildNotebookPlacement, parseVerticalNumbers } from './placement';

describe('page model', () => {
    test('creates an A4 print grid with 5mm cells and 10mm margins', () => {
        const page = createPageModel();

        expect(page.pageWidthMm).toBe(210);
        expect(page.pageHeightMm).toBe(297);
        expect(page.marginMm).toBe(10);
        expect(page.cellSizeMm).toBe(5);
        expect(page.cols).toBe(38);
        expect(page.rows).toBe(55);
    });
});

describe('notebook placement', () => {
    test('aligns vertical numbers without reversing digits', () => {
        const parsed = parseVerticalNumbers({ numbers: [123, 45] });

        expect(parsed.alignedDigits).toEqual([
            [1, 2, 3],
            [null, 4, 5]
        ]);
    });

    test('places digits, operator, and answer line on the shared grid', () => {
        const placement = buildNotebookPlacement(
            [{ example: { numbers: [123, 45], type: 'addition' }, index: 0 }],
            '+'
        );

        const digitValues = placement.cells
            .filter((cell) => cell.kind === 'digit')
            .map((cell) => cell.value);
        const operatorCell = placement.cells.find((cell) => cell.kind === 'operator');
        const lineCells = placement.cells.filter((cell) => cell.kind === 'line');

        expect(digitValues).toEqual(['1', '2', '3', '4', '5']);
        expect(operatorCell).toMatchObject({ row: 2, kind: 'operator', value: '+' });
        expect(lineCells).toHaveLength(3);
        expect(lineCells.every((cell) => cell.row === 3)).toBe(true);
    });

    test('reports overflow instead of scaling when content exceeds one page', () => {
        const examples = Array.from({ length: 80 }, (_, index) => ({
            example: { numbers: [123, 45], type: 'addition' },
            index
        }));

        const placement = buildNotebookPlacement(examples, '+');

        expect(placement.overflow).toBe(true);
        expect(placement.requiredRows).toBeGreaterThan(placement.page.rows);
    });
});
