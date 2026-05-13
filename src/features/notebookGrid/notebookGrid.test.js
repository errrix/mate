import { describe, expect, test } from 'vitest';
import { createPageModel } from './pageModel';
import { buildNotebookPlacement, parseVerticalNumbers } from './placement';

describe('page model', () => {
    test('creates an A4 print grid with reserved header and footer space', () => {
        const page = createPageModel();

        expect(page.pageWidthMm).toBe(210);
        expect(page.pageHeightMm).toBe(297);
        expect(page.marginMm).toBe(0);
        expect(page.headerHeightMm).toBe(24);
        expect(page.footerHeightMm).toBe(14);
        expect(page.contentHeightMm).toBe(259);
        expect(page.cellSizeMm).toBe(7);
        expect(page.cols).toBe(30);
        expect(page.rows).toBe(37);
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

    test('places one-digit addition in a single row without an answer line', () => {
        const placement = buildNotebookPlacement(
            [{ example: { numbers: [4, 7], type: 'addition' }, index: 0 }],
            '+'
        );

        const contentCells = placement.cells
            .map((cell) => ({ row: cell.row, col: cell.col, kind: cell.kind, value: cell.value }));

        expect(contentCells).toEqual([
            { row: 1, col: 12, kind: 'example-number', value: '1.' },
            { row: 1, col: 13, kind: 'digit', value: '4' },
            { row: 1, col: 14, kind: 'operator', value: '+' },
            { row: 1, col: 15, kind: 'digit', value: '7' },
            { row: 1, col: 16, kind: 'operator', value: '=' }
        ]);
        expect(placement.cells.filter((cell) => cell.kind === 'answer-line')).toHaveLength(0);
    });

    test('adds answers to the last page when requested', () => {
        const placement = buildNotebookPlacement(
            [
                { example: { numbers: [4, 7], type: 'addition' }, index: 0 },
                { example: { numbers: [12, 7], type: 'subtraction' }, index: 1 },
                { example: { numbers: [6, 8], type: 'multiplication' }, index: 2 }
            ],
            '+',
            { printAnswers: true }
        );

        expect(placement.answers).toEqual([
            { number: 1, value: '11' },
            { number: 2, value: '5' },
            { number: 3, value: '48' }
        ]);
        expect(placement.pages[0].answers).toEqual(placement.answers);
    });

    test('places mixed one- and two-digit subtraction in a single row', () => {
        const placement = buildNotebookPlacement(
            [{ example: { numbers: [12, 7], type: 'subtraction' }, index: 0 }],
            '-'
        );
        const reversedPlacement = buildNotebookPlacement(
            [{ example: { numbers: [7, 12], type: 'subtraction' }, index: 0 }],
            '-'
        );

        const values = placement.cells
            .filter((cell) => ['digit', 'operator'].includes(cell.kind))
            .map((cell) => cell.value);
        const rows = new Set(placement.cells.map((cell) => cell.row));
        const reversedRows = new Set(reversedPlacement.cells.map((cell) => cell.row));

        expect(values).toEqual(['1', '2', '-', '7', '=']);
        expect([...rows]).toEqual([1]);
        expect([...reversedRows]).toEqual([1]);
        expect(placement.cells.filter((cell) => cell.kind === 'line')).toHaveLength(0);
        expect(placement.cells.filter((cell) => cell.kind === 'answer-line')).toHaveLength(0);
    });

    test('places one-digit subtraction in a single row', () => {
        const placement = buildNotebookPlacement(
            [{ example: { numbers: [8, 3], type: 'subtraction' }, index: 0 }],
            '-'
        );

        const values = placement.cells
            .filter((cell) => ['digit', 'operator'].includes(cell.kind))
            .map((cell) => cell.value);

        expect(values).toEqual(['8', '-', '3', '=']);
        expect(new Set(placement.cells.map((cell) => cell.row))).toEqual(new Set([1]));
        expect(placement.cells.filter((cell) => cell.kind === 'line')).toHaveLength(0);
    });

    test('places one-digit multiplication in a single row', () => {
        const placement = buildNotebookPlacement(
            [{ example: { numbers: [6, 8], type: 'multiplication' }, index: 0 }],
            'Г—'
        );

        const values = placement.cells
            .filter((cell) => ['digit', 'operator'].includes(cell.kind))
            .map((cell) => cell.value);

        expect(values).toEqual(['6', 'Г—', '8', '=']);
        expect(new Set(placement.cells.map((cell) => cell.row))).toEqual(new Set([1]));
        expect(placement.requiredRows).toBe(2);
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

    test('paginates when content exceeds one page', () => {
        const examples = Array.from({ length: 80 }, (_, index) => ({
            example: { numbers: [123, 45], type: 'addition' },
            index
        }));

        const placement = buildNotebookPlacement(examples, '+');

        expect(placement.overflow).toBe(false);
        expect(placement.pages.length).toBeGreaterThan(1);
        expect(placement.pages.every((page) => (
            Math.max(...page.cells.map((cell) => cell.row)) < placement.page.rows
        ))).toBe(true);
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
