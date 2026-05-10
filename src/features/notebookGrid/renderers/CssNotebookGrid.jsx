import React from 'react';

function itemClassName(cell) {
    return `notebook-overlay-item notebook-overlay-${cell.kind}`;
}

export function CssNotebookGrid({ placement }) {
    const { page, cells } = placement;

    return (
        <div className="print-page print-page-css">
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
                        {cell.value}
                    </div>
                ))}
            </div>
        </div>
    );
}
