import React from 'react';

function cellClassName(cell) {
    const classNames = ['notebook-cell'];

    if (cell?.kind === 'operator') {
        classNames.push('notebook-cell-operator');
    }
    if (cell?.kind === 'digit') {
        classNames.push('notebook-cell-digit');
    }
    if (cell?.kind === 'line') {
        classNames.push('notebook-cell-line');
    }

    return classNames.join(' ');
}

function renderCellValue(cell) {
    if (!cell?.value) {
        return '';
    }

    if (!cell.decimalSeparatorAfter) {
        return cell.value;
    }

    return (
        <>
            <span>{cell.value}</span>
            <span className="notebook-decimal-separator">,</span>
        </>
    );
}

export function DomNotebookGrid({ placement }) {
    const { page, cells } = placement;
    const cellMap = new Map(cells.map((cell) => [`${cell.row}-${cell.col}`, cell]));
    const renderedCells = [];

    for (let row = 0; row < page.rows; row++) {
        for (let col = 0; col < page.cols; col++) {
            const key = `${row}-${col}`;
            const cell = cellMap.get(key);
            renderedCells.push(
                <div key={key} className={cellClassName(cell)}>
                    {renderCellValue(cell)}
                </div>
            );
        }
    }

    return (
        <div className="print-page print-page-dom">
            <div
                className="notebook-grid notebook-grid-dom"
                style={{
                    gridTemplateColumns: `repeat(${page.cols}, var(--notebook-cell-size))`,
                    gridTemplateRows: `repeat(${page.rows}, var(--notebook-cell-size))`
                }}
            >
                {renderedCells}
            </div>
        </div>
    );
}
