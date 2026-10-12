import React, { useEffect, useRef, useState } from 'react';
import { isAnswersOnlyPage } from '../placement';

const CSS_PX_PER_MM = 96 / 25.4;

// Shrinks the A4 sheet to the available width on screen; print resets it in CSS.
function useFitScale(pageWidthMm) {
    const containerRef = useRef(null);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const container = containerRef.current;

        if (!container || typeof ResizeObserver === 'undefined') {
            return undefined;
        }

        const pageWidthPx = pageWidthMm * CSS_PX_PER_MM;
        const observer = new ResizeObserver(([entry]) => {
            setScale(Math.min(1, entry.contentRect.width / pageWidthPx));
        });

        observer.observe(container);

        return () => observer.disconnect();
    }, [pageWidthMm]);

    return [containerRef, scale];
}

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
            {/* Drawn as a shape: the monospace comma glyph is too thin to survive print. */}
            <span className="notebook-decimal-separator">
                <span className="notebook-decimal-separator-text">,</span>
                <svg viewBox="0 0 10 16" aria-hidden="true">
                    <path d="M5.5 1A3.7 3.7 0 0 1 9.2 4.7C9.2 9 6.8 12.6 3 14.6L2.1 13.3C4.1 12.1 5.4 10.4 5.7 8.4A3.7 3.7 0 0 1 5.5 1Z" />
                </svg>
            </span>
        </>
    );
}

export function CssNotebookGrid({ placement, pageNumberOffset = 0 }) {
    const { page } = placement;
    const pages = placement.pages ?? [{ number: 1, cells: placement.cells }];
    const verticalLines = Array.from({ length: page.cols + 1 }, (_, col) => col);
    const horizontalLines = Array.from({ length: page.rows + 1 }, (_, row) => row);
    const fallbackAnswerRows = placement.answerRows ?? placement.layout.answerRows;
    const [stackRef, fitScale] = useFitScale(page.pageWidthMm);

    return (
        <div className="notebook-page-stack" ref={stackRef}>
            {pages.map((placementPage) => (
                <div
                    className={`print-page print-page-css${isAnswersOnlyPage(placementPage) ? ' print-page-answers-only' : ''}`}
                    key={`page-${placementPage.number}`}
                    style={{ zoom: fitScale }}
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
                                style={{
                                    minHeight: `calc(${placementPage.answerRows ?? fallbackAnswerRows} * var(--notebook-cell-size))`
                                }}
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
                        Лист {placementPage.number + pageNumberOffset}
                    </footer>
                </div>
            ))}
        </div>
    );
}
