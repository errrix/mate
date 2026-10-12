import React from 'react';
import { buildNotebookPlacement } from './placement';
import { CssNotebookGrid } from './renderers/CssNotebookGrid';

export function NotebookGrid({
    items,
    operator,
    title,
    printAnswers = false,
    placement = buildNotebookPlacement(items, operator, { printAnswers }),
    pageNumberOffset = 0
}) {
    return (
        <div className="notebook-section">
            {title && <h2 className="notebook-title">{title}</h2>}
            {placement.overflow && (
                <div className="notebook-warning">
                    Примеры слишком крупные для печатной сетки A4. Уменьшите параметры задания.
                </div>
            )}
            <CssNotebookGrid placement={placement} pageNumberOffset={pageNumberOffset} />
        </div>
    );
}
