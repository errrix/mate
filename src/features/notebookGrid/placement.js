import { DEFAULT_PAGE_MODEL } from './pageModel';

export const DEFAULT_NOTEBOOK_LAYOUT = {
    gapRows: 2,
    operationGapRows: 2,
    topPaddingRows: 1,
    answerRows: 4,
    minColsPerExample: 5,
    minGapColsBetweenExamples: 2,
    maxGapColsBetweenExamples: 3,
    sidePaddingCols: 2
};

// Mirrors the .print-answers block in ExamplesScreen.css (sizes in mm).
const ANSWER_BLOCK = {
    columns: 4,
    chromeHeightMm: 10.6,
    lineHeightMm: 5.05
};

// Used when one sheet mixes operations and no single operator is passed in.
const TYPE_OPERATORS = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: '÷'
};

function getExampleOperator(example, operator) {
    return example.operator ?? operator ?? TYPE_OPERATORS[example.type];
}

function getMaxValue(values, fallback = 0) {
    return values.length === 0
        ? fallback
        : values.reduce((max, value) => Math.max(max, value), -Infinity);
}

function getAnswerRows(answersCount, page, layout) {
    const answerLines = Math.ceil(answersCount / ANSWER_BLOCK.columns);
    const requiredHeightMm = ANSWER_BLOCK.chromeHeightMm + answerLines * ANSWER_BLOCK.lineHeightMm;

    return Math.max(layout.answerRows, Math.ceil(requiredHeightMm / page.cellSizeMm));
}

function getAnswersPerPage(page) {
    const gridHeightMm = page.rows * page.cellSizeMm;
    const answerLines = Math.floor((gridHeightMm - ANSWER_BLOCK.chromeHeightMm) / ANSWER_BLOCK.lineHeightMm);

    return Math.max(1, answerLines) * ANSWER_BLOCK.columns;
}

function chunkAnswers(answers, size) {
    const chunks = [];

    for (let start = 0; start < answers.length; start += size) {
        chunks.push(answers.slice(start, start + size));
    }

    return chunks;
}

function getPageRowsHeight(rowsForPage, layout) {
    return layout.topPaddingRows
        + rowsForPage.reduce((total, row, index) => (
            total + row.height + (index < rowsForPage.length - 1 ? row.advanceHeight - row.height : 0)
        ), 0);
}

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
    const exampleOperator = getExampleOperator(example, operator);

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

    const maxAnswerWidth = getMaxValue(divisionExamples.map(({ parsed }) => parsed.answerWidth));
    const maxHeight = getMaxValue(divisionExamples.map(({ parsed }) => parsed.height));

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
    // One-line examples need no room for carries, so their rows sit one cell apart.
    const gapRows = parsedExample.parsed.kind === 'horizontal'
        || parsedExample.example.type === 'multiplication'
        || parsedExample.example.type === 'division'
        ? 1
        : layout.gapRows;

    return getContentHeight(parsedExample) + gapRows;
}

// Long multiplication writes a product that is wider than the factors and grows to the left.
function getProductWidth({ example, parsed }) {
    return example.type === 'multiplication' && parsed.kind === 'vertical'
        ? example.numbers.reduce((total, number) => total + getDigitCount(number), 0)
        : 0;
}

// A one-line example keeps a free cell after "=" so a two-digit answer fits before the next example.
function getSlotWidth(parsedExample, layout) {
    const { parsed } = parsedExample;
    const contentWidth = parsed.kind === 'horizontal' ? parsed.width + 1 : parsed.width;

    return Math.max(layout.minColsPerExample, contentWidth, getProductWidth(parsedExample));
}

function getSlotOffset(parsedExample) {
    const { parsed, slotWidth } = parsedExample;

    return getProductWidth(parsedExample) > parsed.width
        ? slotWidth - parsed.width
        : Math.max(0, Math.floor((slotWidth - parsed.width) / 2));
}

function buildExampleRows(parsedExamples, page, layout) {
    const rows = [];
    let currentRow = [];
    let currentMinWidth = 0;
    const usableCols = page.cols - layout.sidePaddingCols * 2;
    const flushRow = () => {
        rows.push({
            examples: currentRow,
            type: currentRow[0].example.type,
            width: currentMinWidth,
            height: Math.max(...currentRow.map((example) => getContentHeight(example))),
            advanceHeight: Math.max(...currentRow.map((example) => getAdvanceHeight(example, layout)))
        });
        currentRow = [];
        currentMinWidth = 0;
    };

    parsedExamples.forEach((parsedExample) => {
        const slotWidth = getSlotWidth(parsedExample, layout);
        const nextMinWidth = currentRow.length === 0
            ? slotWidth
            : currentMinWidth + layout.minGapColsBetweenExamples + slotWidth;
        // Each operation starts on its own row band so a mixed sheet reads as blocks.
        const startsNewOperation = currentRow.length > 0
            && currentRow[0].example.type !== parsedExample.example.type;

        if (currentRow.length > 0 && (startsNewOperation || nextMinWidth > usableCols)) {
            flushRow();
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
        flushRow();
    }

    // Keep a visible pause between operation blocks even when rows inside a block sit tight.
    return rows.map((row, index) => (
        rows[index + 1] && rows[index + 1].type !== row.type
            ? { ...row, advanceHeight: Math.max(row.advanceHeight, row.height + layout.operationGapRows) }
            : row
    ));
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

function paginateRows(rows, page, layout) {
    const pages = [];
    let currentPageRows = [];
    let currentRowStart = layout.topPaddingRows;
    const usableRows = page.rows;

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
        const nextRow = pageRows[rowIndex + 1];
        const isLastRowOfOperation = !nextRow || nextRow.type !== row.type;
        const lastSlotWidth = row.examples[row.examples.length - 1].slotWidth;
        const hasRoomForAnotherExample = row.width + layout.minGapColsBetweenExamples + lastSlotWidth
            <= page.cols - layout.sidePaddingCols * 2;
        const isIncompleteLastRow = isLastRowOfOperation && hasRoomForAnotherExample;
        const rowStartCols = isIncompleteLastRow
            ? getLeftAlignedRowStartCols(row, layout)
            : getDistributedRowStartCols(row, page, layout);

        row.examples.forEach((slotExample, exampleIndex) => {
            const { example, parsed, index } = slotExample;
            const startCol = rowStartCols[exampleIndex] + getSlotOffset(slotExample);
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

            appendVerticalCells(cells, parsed, getExampleOperator(example, operator), startRow, startCol);
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
    const pageRows = paginateRows(rows, page, layout);
    const answers = placementOptions.printAnswers
        ? examples.map(({ example, index }) => ({
            number: index + 1,
            value: getExampleAnswer(example)
        }))
        : [];
    const requiredRows = getMaxValue(
        pageRows.map((rowsForPage) => getPageRowsHeight(rowsForPage, layout)),
        layout.topPaddingRows
    );
    const lastExamplesPageHeight = getPageRowsHeight(pageRows[pageRows.length - 1], layout);
    const answersFitUnderExamples = answers.length > 0
        && lastExamplesPageHeight + getAnswerRows(answers.length, page, layout) <= page.rows;
    // Answers go under the last examples, or on sheets of their own when there is no room left.
    const answerSheets = answers.length === 0 || answersFitUnderExamples
        ? []
        : chunkAnswers(answers, getAnswersPerPage(page));
    const pages = [
        ...pageRows.map((rowsForPage, index) => ({
            cells: renderPageRows(rowsForPage, page, layout, operator),
            answers: answersFitUnderExamples && index === pageRows.length - 1 ? answers : []
        })),
        ...answerSheets.map((sheetAnswers) => ({ cells: [], answers: sheetAnswers }))
    ].map((placementPage, index) => ({
        number: index + 1,
        ...placementPage,
        answerRows: placementPage.answers.length > 0
            ? getAnswerRows(placementPage.answers.length, page, layout)
            : 0
    }));
    const answerRows = pages[pages.length - 1].answerRows;
    const cells = pages.flatMap((placementPage) => placementPage.cells);
    const requiredCols = cells.length > 0
        ? getMaxValue(cells.map((cell) => cell.col)) + 1
        : page.cols;
    const rowTooTall = rows.some((row) => layout.topPaddingRows + row.height > page.rows);

    return {
        page,
        layout,
        options: placementOptions,
        pages,
        answers,
        answerRows,
        cells,
        overflow: rowTooTall || requiredCols > page.cols,
        requiredRows,
        requiredCols
    };
}
