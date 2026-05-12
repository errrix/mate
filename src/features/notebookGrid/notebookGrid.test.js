import { describe, expect, test } from 'vitest';
import { createPageModel } from './pageModel';
import { buildNotebookPlacement, parseVerticalNumbers } from './placement';

describe('page model', () => {
    test('creates a full-page A4 print grid with 7mm cells', () => {
        const page = createPageModel();

        expect(page.pageWidthMm).toBe(210);
        expect(page.pageHeightMm).toBe(297);
        expect(page.marginMm).toBe(0);
        expect(page.cellSizeMm).toBe(7);
        expect(page.cols).toBe(30);
        expect(page.rows).toBe(42);
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

    test('wraps wide decimal examples and distributes horizontal gaps', () => {
        const examples = Array.from({ length: 5 }, (_, index) => ({
            example: { numbers: ['1234,56', '2345,67', '3456,78'], type: 'addition' },
            index
        }));
        const placement = buildNotebookPlacement(examples, '+');
        const firstRowOperatorCols = placement.cells
            .filter((cell) => cell.kind === 'operator' && cell.row === 2)
            .map((cell) => cell.col);
        const lastRowOperatorCols = placement.cells
            .filter((cell) => cell.kind === 'operator' && cell.row === 9)
            .map((cell) => cell.col);
        const lineRows = placement.cells
            .filter((cell) => cell.kind === 'line')
            .reduce((acc, cell) => ({
                ...acc,
                [cell.row]: (acc[cell.row] ?? 0) + 1
            }), {});

        expect(Math.max(...placement.cells.map((cell) => cell.col))).toBeLessThan(placement.page.cols);
        expect(firstRowOperatorCols).toEqual([2, 12, 21]);
        expect(lastRowOperatorCols).toEqual([2, 11]);
        expect(lineRows).toMatchObject({
            4: 18,
            11: 12
        });
        expect(placement.requiredCols).toBe(28);
        expect(placement.overflow).toBe(false);
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

    test('reserves solution rows for multi-digit multiplication', () => {
        const examples = Array.from({ length: 4 }, (_, index) => ({
            example: { numbers: [123, 456], type: 'multiplication' },
            index
        }));

        const placement = buildNotebookPlacement(examples, '×');
        const firstRowOperatorCols = placement.cells
            .filter((cell) => cell.kind === 'operator' && cell.row === 2)
            .map((cell) => cell.col);
        const secondRowOperator = placement.cells
            .find((cell) => cell.kind === 'operator' && cell.row > 2);
        const lineRows = placement.cells
            .filter((cell) => cell.kind === 'line')
            .reduce((rows, cell) => rows.add(cell.row), new Set());

        expect(firstRowOperatorCols).toEqual([3, 12, 21]);
        expect([...lineRows]).toEqual([3, 11]);
        expect(secondRowOperator).toMatchObject({ row: 10, col: 3 });
        expect(placement.requiredRows).toBe(16);
    });

    test('places division corner on the shared grid and reserves work rows', () => {
        const placement = buildNotebookPlacement(
            [
                { example: { dividend: 864, divisor: 12, type: 'division' }, index: 0 },
                { example: { dividend: 735, divisor: 7, type: 'division' }, index: 1 }
            ],
            '÷'
        );
        const digitCells = placement.cells.filter((cell) => cell.kind === 'digit');
        const verticalLineCells = placement.cells.filter((cell) => cell.kind === 'vertical-line');
        const horizontalLineCells = placement.cells.filter((cell) => cell.kind === 'line');

        expect(digitCells.map((cell) => cell.value)).toEqual([
            '8', '6', '4', '1', '2',
            '7', '3', '5', '7'
        ]);
        expect(verticalLineCells.filter((cell) => cell.col === 5).map((cell) => cell.row))
            .toEqual([1, 2, 3, 4, 5, 6, 7]);
        expect(horizontalLineCells
            .filter((cell) => cell.row === 2 && cell.col < 10)
            .map((cell) => cell.col))
            .toEqual([5, 6, 7, 8]);
        expect(placement.requiredRows).toBe(8);
        expect(placement.overflow).toBe(false);
    });

    test('keeps division columns aligned across rows with different quotient widths', () => {
        const placement = buildNotebookPlacement(
            [
                { example: { dividend: 208, divisor: 8, type: 'division' }, index: 0 },
                { example: { dividend: 525, divisor: 7, type: 'division' }, index: 1 },
                { example: { dividend: 492, divisor: 4, type: 'division' }, index: 2 },
                { example: { dividend: 234, divisor: 6, type: 'division' }, index: 3 },
                { example: { dividend: 776, divisor: 4, type: 'division' }, index: 4 },
                { example: { dividend: 760, divisor: 8, type: 'division' }, index: 5 }
            ],
            '÷'
        );
        const verticalLineColsByRow = placement.cells
            .filter((cell) => cell.kind === 'vertical-line')
            .reduce((rows, cell) => {
                rows[cell.row] = rows[cell.row] ?? new Set();
                rows[cell.row].add(cell.col);
                return rows;
            }, {});

        expect([...verticalLineColsByRow[1]]).toEqual([5, 15, 24]);
        expect([...verticalLineColsByRow[9]]).toEqual([5, 15, 24]);
    });

    test('keeps division vertical lines the same height for different quotient widths', () => {
        const placement = buildNotebookPlacement(
            [
                { example: { dividend: 616, divisor: 8, type: 'division' }, index: 0 },
                { example: { dividend: 891, divisor: 9, type: 'division' }, index: 1 },
                { example: { dividend: 925, divisor: 5, type: 'division' }, index: 2 }
            ],
            '÷'
        );
        const lineHeights = placement.cells
            .filter((cell) => cell.kind === 'vertical-line')
            .reduce((heights, cell) => ({
                ...heights,
                [cell.col]: (heights[cell.col] ?? 0) + 1
            }), {});

        expect(Object.values(lineHeights)).toEqual([7, 7, 7]);
    });
});
