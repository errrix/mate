import { DEFAULT_PAGE_MODEL } from './pageModel';

export const DEFAULT_NOTEBOOK_LAYOUT = {
    gapRows: 3,
    topPaddingRows: 1,
    answerRows: 9,
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

function getNumericValue(value) {
    return Number(String(value).replace(',', '.'));
}

function formatAnswer(value) {
    const roundedValue = Math.round((value + Number.EPSILON) * 100) / 100;

    return Number.isInteger(roundedValue)
        ? String(roundedValue)
        : String(roundedValue).replace('.', ',');
}

function getExampleAnswer(example) {
    if (example.type === 'addition') {
        return formatAnswer(example.numbers.reduce((total, number) => total + getNumericValue(number), 0));
    }

    if (example.type === 'subtraction') {
        return formatAnswer(getNumericValue(example.numbers[0]) - getNumericValue(example.numbers[1]));
    }

    if (example.type === 'multiplication') {
        return formatAnswer(getNumericValue(example.numbers[0]) * getNumericValue(example.numbers[1]));
    }

    if (example.type === 'division') {
        return formatAnswer(getNumericValue(example.dividend) / getNumericValue(example.divisor));
    }

    return '';
}

function isIntegerLike(value) {
    return /^\d+$/.test(String(value));
}

function shouldUseHorizontalFormat(example) {
    if (!['addition', 'subtraction', 'multiplication'].includes(example.type)) {
        return false;
    }

    if (!example.numbers.every(isIntegerLike)) {
        return false;
    }

    const digitCounts = example.numbers.map(getDigitCount);

    if (example.type === 'addition' || example.type === 'multiplication') {
        return digitCounts.every((count) => count === 1);
    }

    return digitCounts.length === 2
        && digitCounts.every((count) => count === 1 || count === 2)
        && digitCounts.some((count) => count === 1);
}

function parseHorizontalExample(example, operator) {
    const tokens = [];
    const exampleOperator = example.operator ?? operator;

    example.numbers.forEach((number, numberIndex) => {
        if (numberIndex > 0) {
            tokens.push({ kind: 'operator', value: exampleOperator });
        }

        getNumberTokens(number).forEach((digit) => {
            tokens.push({ kind: 'digit', value: digit.value });
        });
    });

    tokens.push({ kind: 'operator', value: '=' });

    return {
        kind: 'horizontal',
        tokens,
        width: tokens.length,
        height: 1
    };
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

function parseNotebookExample(example, operator) {
    if (example.type === 'division') {
        return parseDivisionExample(example);
    }

    if (shouldUseHorizontalFormat(example)) {
        return parseHorizontalExample(example, operator);
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

    if (parsed.kind === 'horizontal') {
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

function appendDivisionCells(cells, parsed, startRow, startCol) {
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
}

function appendHorizontalCells(cells, parsed, startRow, startCol) {
    parsed.tokens.forEach((token, tokenIndex) => {
        cells.push({
            row: startRow,
            col: startCol + tokenIndex,
            kind: token.kind,
            value: token.value
        });
    });
}

function appendVerticalCells(cells, parsed, operator, startRow, startCol) {
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
}

function paginateRows(rows, page, layout, options) {
    const pages = [];
    let currentPageRows = [];
    let currentRowStart = layout.topPaddingRows;
    const usableRows = options.printAnswers
        ? page.rows - layout.answerRows
        : page.rows;

    rows.forEach((row) => {
        const rowWouldOverflow = currentPageRows.length > 0
            && currentRowStart + row.height > usableRows;

        if (rowWouldOverflow) {
            pages.push(currentPageRows);
            currentPageRows = [];
            currentRowStart = layout.topPaddingRows;
        }

        currentPageRows.push(row);
        currentRowStart += row.advanceHeight;
    });

    if (currentPageRows.length > 0) {
        pages.push(currentPageRows);
    }

    return pages;
}

function renderPageRows(pageRows, page, layout, operator) {
    const cells = [];
    let currentRowStart = layout.topPaddingRows;

    pageRows.forEach((row, rowIndex) => {
        const isLastRow = rowIndex === pageRows.length - 1;
        const isIncompleteLastRow = isLastRow
            && rowIndex > 0
            && row.examples.length < pageRows[rowIndex - 1].examples.length;
        const rowStartCols = isIncompleteLastRow
            ? getLeftAlignedRowStartCols(row, layout)
            : getDistributedRowStartCols(row, page, layout);

        row.examples.forEach(({ parsed, slotWidth, index }, exampleIndex) => {
            const slotStartCol = rowStartCols[exampleIndex];
            const startCol = slotStartCol + Math.max(0, Math.floor((slotWidth - parsed.width) / 2));
            const startRow = currentRowStart;

            cells.push({
                row: startRow,
                col: Math.max(0, startCol - 1),
                kind: 'example-number',
                value: `${index + 1}.`
            });

            if (parsed.kind === 'division') {
                appendDivisionCells(cells, parsed, startRow, startCol);
                return;
            }

            if (parsed.kind === 'horizontal') {
                appendHorizontalCells(cells, parsed, startRow, startCol);
                return;
            }

            appendVerticalCells(cells, parsed, operator, startRow, startCol);
        });

        currentRowStart += row.advanceHeight;
    });

    return cells;
}

export function buildNotebookPlacement(items, operator, options = {}) {
    const page = options.page ?? DEFAULT_PAGE_MODEL;
    const layout = { ...DEFAULT_NOTEBOOK_LAYOUT, ...options.layout };
    const placementOptions = {
        printAnswers: options.printAnswers === true
    };
    const examples = items.map((item, index) => ({
        example: item.example ?? item,
        index: item.index ?? index
    }));

    if (examples.length === 0) {
        return {
            page,
            layout,
            pages: [{
                number: 1,
                cells: []
            }],
            answers: [],
            cells: [],
            overflow: false,
            requiredRows: layout.topPaddingRows,
            requiredCols: page.cols
        };
    }

    const parsedExamples = normalizeDivisionWidths(examples.map(({ example, index }) => ({
        example,
        index,
        parsed: parseNotebookExample(example, operator)
    })));

    const rows = buildExampleRows(parsedExamples, page, layout);
    const pageRows = paginateRows(rows, page, layout, placementOptions);
    const answers = placementOptions.printAnswers
        ? examples.map(({ example, index }) => ({
            number: index + 1,
            value: getExampleAnswer(example)
        }))
        : [];
    const pages = pageRows.map((rowsForPage, index) => ({
        number: index + 1,
        cells: renderPageRows(rowsForPage, page, layout, operator),
        answers: index === pageRows.length - 1 ? answers : []
    }));
    const cells = pages.flatMap((placementPage) => placementPage.cells);
    const requiredRows = pageRows.length === 0
        ? layout.topPaddingRows
        : Math.max(...pageRows.map((rowsForPage) => (
            layout.topPaddingRows
            + rowsForPage.reduce((total, row, index) => (
                total + row.height + (index < rowsForPage.length - 1 ? row.advanceHeight - row.height : 0)
            ), 0)
        )));
    const requiredCols = cells.length > 0
        ? Math.max(...cells.map((cell) => cell.col)) + 1
        : page.cols;
    const usableRows = placementOptions.printAnswers
        ? page.rows - layout.answerRows
        : page.rows;
    const rowTooTall = rows.some((row) => layout.topPaddingRows + row.height > usableRows);

    return {
        page,
        layout,
        options: placementOptions,
        pages,
        answers,
        cells,
        overflow: rowTooTall || requiredCols > page.cols,
        requiredRows,
        requiredCols
    };
}
