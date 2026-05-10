import React from 'react';
import { buildNotebookPlacement } from './placement';
import { DomNotebookGrid } from './renderers/DomNotebookGrid';
import { CssNotebookGrid } from './renderers/CssNotebookGrid';
import { SvgNotebookGrid } from './renderers/SvgNotebookGrid';

const RENDERERS = {
    dom: DomNotebookGrid,
    css: CssNotebookGrid,
    svg: SvgNotebookGrid
};

export function NotebookGrid({
    items,
    operator,
    mode = 'dom',
    title
}) {
    const placement = buildNotebookPlacement(items, operator);
    const Renderer = RENDERERS[mode] ?? DomNotebookGrid;

    return (
        <div className="notebook-section">
            <h2 className="notebook-title">{title}</h2>
            {placement.overflow && (
                <div className="notebook-warning">
                    Примеры не помещаются на один лист A4. Уменьшите количество примеров.
                </div>
            )}
            <Renderer placement={placement} />
        </div>
    );
}
