import { DEFAULT_PAGE_MODEL } from './pageModel';

export const DEFAULT_NOTEBOOK_LAYOUT = {
    examplesPerRow: 5,
    gapRows: 3,
    topPaddingRows: 1,
    minColsPerExample: 6
};

export function parseVerticalNumbers(example) {
    const numberDigits = example.numbers.map((number) => (
        number.toString().split('').map(Number)
    ));
    const maxLength = Math.max(...numberDigits.map((digits) => digits.length));
    const alignedDigits = numberDigits.map((digits) => {
        const padding = maxLength - digits.length;
        return [...Array(padding).fill(null), ...digits];
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
                    value: String(digit)
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
