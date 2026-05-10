import React from 'react';

function itemClassName(cell) {
    return `notebook-overlay-item notebook-overlay-${cell.kind}`;
}

function renderItemValue(cell) {
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

export function CssNotebookGrid({ placement }) {
    const { page, cells } = placement;
    const verticalLines = Array.from({ length: page.cols + 1 }, (_, col) => col);
    const horizontalLines = Array.from({ length: page.rows + 1 }, (_, row) => row);

    return (
        <div className="print-page print-page-css">
            <div className="notebook-css-lines" aria-hidden="true">
                {verticalLines.map((col) => (
                    <span
                        key={`v-${col}`}
                        className="notebook-css-line notebook-css-line-vertical"
                        style={{ left: `calc(${col} * var(--notebook-cell-size))` }}
                    />
                ))}
                {horizontalLines.map((row) => (
                    <span
                        key={`h-${row}`}
                        className="notebook-css-line notebook-css-line-horizontal"
                        style={{ top: `calc(${row} * var(--notebook-cell-size))` }}
                    />
                ))}
            </div>
            <div
                className="notebook-overlay-grid"
                style={{
                    gridTemplateColumns: `repeat(${page.cols}, var(--notebook-cell-size))`,
                    gridTemplateRows: `repeat(${page.rows}, var(--notebook-cell-size))`
                }}
            >
                {cells.map((cell, index) => (
                    <div
                        key={`${cell.kind}-${cell.row}-${cell.col}-${index}`}
                        className={itemClassName(cell)}
                        style={{
                            gridColumn: cell.col + 1,
                            gridRow: cell.row + 1
                        }}
                    >
                        {renderItemValue(cell)}
                    </div>
                ))}
            </div>
        </div>
    );
}
