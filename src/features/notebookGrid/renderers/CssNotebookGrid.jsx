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
    const { page } = placement;
    const pages = placement.pages ?? [{ number: 1, cells: placement.cells }];
    const verticalLines = Array.from({ length: page.cols + 1 }, (_, col) => col);
    const horizontalLines = Array.from({ length: page.rows + 1 }, (_, row) => row);

    return (
        <div className="notebook-page-stack">
            {pages.map((placementPage) => (
                <div
                    className="print-page print-page-css"
                    key={`page-${placementPage.number}`}
                >
                    <header className="print-page-header">
                        <div className="print-page-field">
                            <span>Имя</span>
                            <strong aria-hidden="true" />
                        </div>
                        <div className="print-page-field print-page-field-date">
                            <span>Дата</span>
                            <strong aria-hidden="true" />
                        </div>
                    </header>
                    <div className="notebook-grid-frame">
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
                            {placementPage.cells.map((cell, index) => (
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
                        {placementPage.answers?.length > 0 && (
                            <section
                                className="print-answers"
                                style={{ minHeight: `calc(${placement.layout.answerRows} * var(--notebook-cell-size))` }}
                                aria-label="Ответы"
                            >
                                <h3>Ответы</h3>
                                <ol className="print-answer-list">
                                    {placementPage.answers.map((answer) => (
                                        <li key={answer.number}>
                                            <span>{answer.number}:</span> {answer.value}
                                        </li>
                                    ))}
                                </ol>
                            </section>
                        )}
                    </div>
                    <footer className="print-page-footer">
                        Лист {placementPage.number}
                    </footer>
                </div>
            ))}
        </div>
    );
}
