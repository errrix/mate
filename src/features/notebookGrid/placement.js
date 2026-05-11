import { DEFAULT_PAGE_MODEL } from './pageModel';

export const DEFAULT_NOTEBOOK_LAYOUT = {
    gapRows: 3,
    topPaddingRows: 1,
    minColsPerExample: 6,
    minGapColsBetweenExamples: 2,
    sidePaddingCols: 2
};

function parsePrintableNumberParts(number) {
    const text = String(number);
    const decimalMatch = text.match(/^(\d+)[,.](\d+)$/);

    if (!decimalMatch) {
        return {
            integerTokens: text.split('').map((value) => ({ value })),
            fractionTokens: [],
            hasDecimal: false
        };
    }

    const [, integerPart, decimalPart] = decimalMatch;
    const trimmedDecimalPart = decimalPart.replace(/0+$/, '');
    const integerTokens = integerPart.split('').map((value) => ({ value }));
    const fractionTokens = trimmedDecimalPart.split('').map((value) => ({ value }));

    if (fractionTokens.length > 0) {
        integerTokens[integerTokens.length - 1] = {
            ...integerTokens[integerTokens.length - 1],
            decimalSeparatorAfter: true
        };
    }

    return {
        integerTokens,
        fractionTokens,
        hasDecimal: fractionTokens.length > 0
    };
}

export function parseVerticalNumbers(example) {
    const numberDigits = example.numbers.map((number) => (
        parsePrintableNumberParts(number)
    ));
    const hasDecimals = numberDigits.some((digits) => digits.hasDecimal);
    const maxIntegerLength = Math.max(...numberDigits.map((digits) => digits.integerTokens.length));
    const maxFractionLength = Math.max(...numberDigits.map((digits) => digits.fractionTokens.length));
    const maxLength = hasDecimals
        ? maxIntegerLength + maxFractionLength
        : Math.max(...numberDigits.map((digits) => digits.integerTokens.length));
    const alignedDigits = numberDigits.map((digits) => {
        const integerPadding = maxIntegerLength - digits.integerTokens.length;

        if (!hasDecimals) {
            return [
                ...Array(integerPadding).fill(null),
                ...digits.integerTokens
            ];
        }

        const fractionPadding = maxFractionLength - digits.fractionTokens.length;

        return [
            ...Array(integerPadding).fill(null),
            ...digits.integerTokens,
            ...digits.fractionTokens,
            ...Array(fractionPadding).fill(null)
        ];
    });

    return {
        alignedDigits,
        maxLength,
        numbersCount: example.numbers.length,
        width: maxLength + 1,
        height: example.numbers.length + 1
    };
}

function buildExampleRows(parsedExamples, page, layout) {
    const rows = [];
    let currentRow = [];
    let currentMinWidth = 0;
    const usableCols = page.cols - layout.sidePaddingCols * 2;

    parsedExamples.forEach((parsedExample) => {
        const slotWidth = Math.max(layout.minColsPerExample, parsedExample.parsed.width);
        const nextMinWidth = currentRow.length === 0
            ? slotWidth
            : currentMinWidth + layout.minGapColsBetweenExamples + slotWidth;

        if (currentRow.length > 0 && nextMinWidth > usableCols) {
            rows.push({
                examples: currentRow,
                width: currentMinWidth,
                height: Math.max(...currentRow.map(({ parsed }) => parsed.height))
            });
            currentRow = [];
            currentMinWidth = 0;
        }

        currentRow.push({
            ...parsedExample,
            slotWidth
        });
        currentMinWidth = currentRow.length === 1
            ? slotWidth
            : currentMinWidth + layout.minGapColsBetweenExamples + slotWidth;
    });

    if (currentRow.length > 0) {
        rows.push({
            examples: currentRow,
            width: currentMinWidth,
            height: Math.max(...currentRow.map(({ parsed }) => parsed.height))
        });
    }

    return rows;
}

function getLeftAlignedRowStartCols(row, layout) {
    let nextStartCol = layout.sidePaddingCols;

    return row.examples.map((example, index) => {
        const startCol = nextStartCol;
        const gapWidth = index < row.examples.length - 1
            ? layout.minGapColsBetweenExamples
            : 0;
        nextStartCol += example.slotWidth + gapWidth;
        return startCol;
    });
}

function getDistributedRowStartCols(row, page, layout) {
    if (row.examples.length === 1) {
        return [Math.max(
            layout.sidePaddingCols,
            Math.floor((page.cols - row.examples[0].slotWidth) / 2)
        )];
    }

    const totalSlotWidth = row.examples.reduce((total, example) => total + example.slotWidth, 0);
    const gapCount = row.examples.length - 1;
    const availableGapWidth = page.cols - layout.sidePaddingCols * 2 - totalSlotWidth;
    const baseGapWidth = Math.max(
        layout.minGapColsBetweenExamples,
        Math.floor(availableGapWidth / gapCount)
    );
    let extraGapCols = availableGapWidth - baseGapWidth * gapCount;
    let nextStartCol = layout.sidePaddingCols;

    return row.examples.map((example, index) => {
        const startCol = nextStartCol;
        const gapWidth = index < gapCount
            ? baseGapWidth + (extraGapCols-- > 0 ? 1 : 0)
            : 0;
        nextStartCol += example.slotWidth + gapWidth;
        return startCol;
    });
}

export function buildNotebookPlacement(items, operator, options = {}) {
    const page = options.page ?? DEFAULT_PAGE_MODEL;
    const layout = { ...DEFAULT_NOTEBOOK_LAYOUT, ...options.layout };
    const examples = items.map((item, index) => ({
        example: item.example ?? item,
        index: item.index ?? index
    }));

    if (examples.length === 0) {
        return {
            page,
            layout,
            cells: [],
            overflow: false,
            requiredRows: layout.topPaddingRows,
            requiredCols: page.cols
        };
    }

    const parsedExamples = examples.map(({ example, index }) => ({
        example,
        index,
        parsed: parseVerticalNumbers(example)
    }));

    const rows = buildExampleRows(parsedExamples, page, layout);
    const requiredRows = layout.topPaddingRows
        + rows.reduce((total, row) => total + row.height, 0)
        + Math.max(0, rows.length - 1) * layout.gapRows;
    const cells = [];
    let currentRowStart = layout.topPaddingRows;

    rows.forEach((row, rowIndex) => {
        const isLastRow = rowIndex === rows.length - 1;
        const rowStartCols = isLastRow
            ? getLeftAlignedRowStartCols(row, layout)
            : getDistributedRowStartCols(row, page, layout);

        row.examples.forEach(({ parsed, slotWidth }, exampleIndex) => {
            const slotStartCol = rowStartCols[exampleIndex];
            const startCol = slotStartCol + Math.max(0, Math.floor((slotWidth - parsed.width) / 2));
            const startRow = currentRowStart;

            parsed.alignedDigits.forEach((digits, rowIndex) => {
                if (rowIndex > 0) {
                    cells.push({
                        row: startRow + rowIndex,
                        col: startCol,
                        kind: 'operator',
                        value: operator
                    });
                }

                digits.forEach((digit, digitIndex) => {
                    if (digit === null) {
                        return;
                    }

                    cells.push({
                        row: startRow + rowIndex,
                        col: startCol + 1 + digitIndex,
                        kind: 'digit',
                        value: digit.value,
                        decimalSeparatorAfter: digit.decimalSeparatorAfter === true
                    });
                });
            });

            for (let digitIndex = 0; digitIndex < parsed.maxLength; digitIndex++) {
                cells.push({
                    row: startRow + parsed.numbersCount,
                    col: startCol + 1 + digitIndex,
                    kind: 'line',
                    value: ''
                });
            }
        });

        currentRowStart += row.height + layout.gapRows;
    });
    const requiredCols = cells.length > 0
        ? Math.max(...cells.map((cell) => cell.col)) + 1
        : page.cols;

    return {
        page,
        layout,
        cells,
        overflow: requiredRows > page.rows || requiredCols > page.cols,
        requiredRows,
        requiredCols
    };
}
