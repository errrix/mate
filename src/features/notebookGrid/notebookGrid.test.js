import { describe, expect, test } from 'vitest';
import { createPageModel } from './pageModel';
import { buildNotebookPlacement, parseVerticalNumbers } from './placement';

describe('page model', () => {
    test('creates a full-page A4 print grid with 5mm cells', () => {
        const page = createPageModel();

        expect(page.pageWidthMm).toBe(210);
        expect(page.pageHeightMm).toBe(297);
        expect(page.marginMm).toBe(0);
        expect(page.cellSizeMm).toBe(5);
        expect(page.cols).toBe(42);
        expect(page.rows).toBe(59);
    });
});

describe('notebook placement', () => {
    test('aligns vertical numbers without reversing digits', () => {
        const parsed = parseVerticalNumbers({ numbers: [123, 45] });

        expect(parsed.alignedDigits).toEqual([
            [{ value: '1' }, { value: '2' }, { value: '3' }],
            [null, { value: '4' }, { value: '5' }]
        ]);
    });

    test('attaches decimal separators to the previous digit and trims trailing zeroes', () => {
        const parsed = parseVerticalNumbers({ numbers: ['12,37', '4,50'] });

        expect(parsed.alignedDigits).toEqual([
            [
                { value: '1' },
                { value: '2', decimalSeparatorAfter: true },
                { value: '3' },
                { value: '7' }
            ],
            [
                null,
                { value: '4', decimalSeparatorAfter: true },
                { value: '5' },
                null
            ]
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

    test('places decimal separators without adding columns for them', () => {
        const placement = buildNotebookPlacement(
            [{ example: { numbers: ['12,30', '4,56'], type: 'addition' }, index: 0 }],
            '+'
        );

        const digitCells = placement.cells.filter((cell) => cell.kind === 'digit');
        const decimalCells = digitCells.filter((cell) => cell.decimalSeparatorAfter);
        const lineCells = placement.cells.filter((cell) => cell.kind === 'line');

        expect(digitCells.map((cell) => cell.value)).toEqual(['1', '2', '3', '4', '5', '6']);
        expect(decimalCells.map((cell) => cell.value)).toEqual(['2', '4']);
        expect(lineCells).toHaveLength(4);
    });

    test('keeps decimal separators in the same column', () => {
        const placement = buildNotebookPlacement(
            [{ example: { numbers: ['426,30', '607,3'], type: 'addition' }, index: 0 }],
            '+'
        );

        const decimalCells = placement.cells.filter((cell) => cell.decimalSeparatorAfter);

        expect(decimalCells).toHaveLength(2);
        expect(decimalCells[0].col).toBe(decimalCells[1].col);
        expect(decimalCells.map((cell) => cell.value)).toEqual(['6', '7']);
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
