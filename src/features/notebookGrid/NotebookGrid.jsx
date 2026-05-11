import React from 'react';
import { buildNotebookPlacement } from './placement';
import { CssNotebookGrid } from './renderers/CssNotebookGrid';

export function NotebookGrid({
    items,
    operator,
    title
}) {
    const placement = buildNotebookPlacement(items, operator);

    return (
        <div className="notebook-section">
            <h2 className="notebook-title">{title}</h2>
            {placement.overflow && (
                <div className="notebook-warning">
                    Примеры не помещаются на один лист A4. Уменьшите количество примеров.
                </div>
            )}
            <CssNotebookGrid placement={placement} />
        </div>
    );
}
