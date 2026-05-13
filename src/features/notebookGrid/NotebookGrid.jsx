import React from 'react';
import { buildNotebookPlacement } from './placement';
import { CssNotebookGrid } from './renderers/CssNotebookGrid';

export function NotebookGrid({
    items,
    operator,
    title,
    printAnswers = false
}) {
    const placement = buildNotebookPlacement(items, operator, { printAnswers });

    return (
        <div className="notebook-section">
            <h2 className="notebook-title">{title}</h2>
            {placement.overflow && (
                <div className="notebook-warning">
                    Примеры слишком крупные для печатной сетки A4. Уменьшите параметры задания.
                </div>
            )}
            <CssNotebookGrid placement={placement} />
        </div>
    );
}
