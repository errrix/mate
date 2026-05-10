import { DEFAULT_PAGE_MODEL } from './pageModel';

export const DEFAULT_NOTEBOOK_LAYOUT = {
    examplesPerRow: 5,
    gapRows: 3,
    topPaddingRows: 1,
    minColsPerExample: 6
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

    const maxExampleHeight = Math.max(...parsedExamples.map(({ parsed }) => parsed.height));
    const maxExampleWidth = Math.max(...parsedExamples.map(({ parsed }) => parsed.width));
    const colsPerExample = Math.max(
        layout.minColsPerExample,
        Math.floor(page.cols / layout.examplesPerRow)
    );
    const examplesPerColumn = Math.ceil(parsedExamples.length / layout.examplesPerRow);
    const requiredRows = layout.topPaddingRows
        + examplesPerColumn * maxExampleHeight
        + Math.max(0, examplesPerColumn - 1) * layout.gapRows;
    const cells = [];

    parsedExamples.forEach(({ parsed }, exampleIndex) => {
        const groupCol = exampleIndex % layout.examplesPerRow;
        const groupRow = Math.floor(exampleIndex / layout.examplesPerRow);
        const startCol = groupCol * colsPerExample
            + Math.floor((colsPerExample - maxExampleWidth) / 2);
        const startRow = layout.topPaddingRows
            + groupRow * (maxExampleHeight + layout.gapRows);

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

    return {
        page,
        layout,
        cells,
        overflow: requiredRows > page.rows,
        requiredRows,
        requiredCols: page.cols
    };
}
