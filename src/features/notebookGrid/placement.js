import { DEFAULT_PAGE_MODEL } from './pageModel';

export const DEFAULT_NOTEBOOK_LAYOUT = {
    gapRows: 3,
    topPaddingRows: 1,
    minColsPerExample: 6,
    minGapColsBetweenExamples: 2,
    maxGapColsBetweenExamples: 3,
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

function getNumberTokens(value) {
    return String(value).split('').map((digit) => ({ value: digit }));
}

function getDigitCount(value) {
    return String(value).replace(/\D/g, '').length;
}

function parseDivisionExample(example) {
    const dividendTokens = getNumberTokens(example.dividend);
    const divisorTokens = getNumberTokens(example.divisor);
    const quotient = Math.floor(example.dividend / example.divisor);
    const quotientLength = getDigitCount(quotient);
    const answerWidth = Math.max(divisorTokens.length, quotientLength, 2);

    return {
        kind: 'division',
        dividendTokens,
        divisorTokens,
        quotientLength,
        answerWidth,
        width: dividendTokens.length + 1 + answerWidth,
        height: 2 + quotientLength + 2
    };
}

function normalizeDivisionWidths(parsedExamples) {
    const divisionExamples = parsedExamples.filter(({ parsed }) => parsed.kind === 'division');

    if (divisionExamples.length === 0) {
        return parsedExamples;
    }

    const maxAnswerWidth = Math.max(...divisionExamples.map(({ parsed }) => parsed.answerWidth));
    const maxHeight = Math.max(...divisionExamples.map(({ parsed }) => parsed.height));

    return parsedExamples.map((parsedExample) => {
        if (parsedExample.parsed.kind !== 'division') {
            return parsedExample;
        }

        return {
            ...parsedExample,
            parsed: {
                ...parsedExample.parsed,
                answerWidth: maxAnswerWidth,
                height: maxHeight,
                width: parsedExample.parsed.dividendTokens.length + 1 + maxAnswerWidth
            }
        };
    });
}

function parseNotebookExample(example) {
    if (example.type === 'division') {
        return parseDivisionExample(example);
    }

    return {
        kind: 'vertical',
        ...parseVerticalNumbers(example)
    };
}

function getMultiplicationSolutionRows(example) {
    const multiplierDigits = Math.max(1, getDigitCount(example.numbers[1]));

    return multiplierDigits === 1
        ? 1
        : multiplierDigits + 1;
}

function getContentHeight(parsedExample) {
    const { example, parsed } = parsedExample;

    if (parsed.kind === 'division') {
        return parsed.height;
    }

    if (example.type === 'multiplication') {
        return parsed.height + getMultiplicationSolutionRows(example);
    }

    return parsed.height;
}

function getAdvanceHeight(parsedExample, layout) {
    const gapRows = parsedExample.example.type === 'multiplication'
        || parsedExample.example.type === 'division'
        ? 1
        : layout.gapRows;

    return getContentHeight(parsedExample) + gapRows;
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
                height: Math.max(...currentRow.map((example) => getContentHeight(example))),
                advanceHeight: Math.max(...currentRow.map((example) => getAdvanceHeight(example, layout)))
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
            height: Math.max(...currentRow.map((example) => getContentHeight(example))),
            advanceHeight: Math.max(...currentRow.map((example) => getAdvanceHeight(example, layout)))
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
    const distributedGapWidth = Math.min(
        availableGapWidth,
        layout.maxGapColsBetweenExamples * gapCount
    );
    const baseGapWidth = Math.max(
        layout.minGapColsBetweenExamples,
        Math.floor(distributedGapWidth / gapCount)
    );
    let extraGapCols = distributedGapWidth - baseGapWidth * gapCount;
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

    const parsedExamples = normalizeDivisionWidths(examples.map(({ example, index }) => ({
        example,
        index,
        parsed: parseNotebookExample(example)
    })));

    const rows = buildExampleRows(parsedExamples, page, layout);
    const requiredRows = layout.topPaddingRows
        + rows.reduce((total, row, index) => (
            total + row.height + (index < rows.length - 1 ? row.advanceHeight - row.height : 0)
        ), 0);
    const cells = [];
    let currentRowStart = layout.topPaddingRows;

    rows.forEach((row, rowIndex) => {
        const isLastRow = rowIndex === rows.length - 1;
        const isIncompleteLastRow = isLastRow
            && rowIndex > 0
            && row.examples.length < rows[rowIndex - 1].examples.length;
        const rowStartCols = isIncompleteLastRow
            ? getLeftAlignedRowStartCols(row, layout)
            : getDistributedRowStartCols(row, page, layout);

        row.examples.forEach(({ parsed, slotWidth }, exampleIndex) => {
            const slotStartCol = rowStartCols[exampleIndex];
            const startCol = slotStartCol + Math.max(0, Math.floor((slotWidth - parsed.width) / 2));
            const startRow = currentRowStart;

            if (parsed.kind === 'division') {
                const verticalLineCol = startCol + parsed.dividendTokens.length;

                parsed.dividendTokens.forEach((digit, digitIndex) => {
                    cells.push({
                        row: startRow,
                        col: startCol + digitIndex,
                        kind: 'digit',
                        value: digit.value
                    });
                });

                parsed.divisorTokens.forEach((digit, digitIndex) => {
                    cells.push({
                        row: startRow,
                        col: verticalLineCol + 1 + digitIndex,
                        kind: 'digit',
                        value: digit.value
                    });
                });

                for (let rowOffset = 0; rowOffset < parsed.height; rowOffset++) {
                    cells.push({
                        row: startRow + rowOffset,
                        col: verticalLineCol,
                        kind: 'vertical-line',
                        value: ''
                    });
                }

                for (let digitIndex = 0; digitIndex <= parsed.answerWidth; digitIndex++) {
                    cells.push({
                        row: startRow + 1,
                        col: verticalLineCol + digitIndex,
                        kind: 'line',
                        value: ''
                    });
                }

                return;
            }

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

        currentRowStart += row.advanceHeight;
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
