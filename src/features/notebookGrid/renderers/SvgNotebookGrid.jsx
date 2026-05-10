import React from 'react';

function textAnchor(cell) {
    return cell.kind === 'operator' ? 'middle' : 'middle';
}

export function SvgNotebookGrid({ placement }) {
    const { page, cells } = placement;
    const contentWidth = page.cols * page.cellSizeMm;
    const contentHeight = page.rows * page.cellSizeMm;

    return (
        <div className="print-page print-page-svg">
            <svg
                className="notebook-svg"
                viewBox={`0 0 ${contentWidth} ${contentHeight}`}
                width={`${contentWidth}mm`}
                height={`${contentHeight}mm`}
                xmlns="http://www.w3.org/2000/svg"
            >
                {Array.from({ length: page.cols + 1 }, (_, col) => (
                    <line
                        key={`v-${col}`}
                        className="notebook-svg-grid-line"
                        x1={col * page.cellSizeMm}
                        y1="0"
                        x2={col * page.cellSizeMm}
                        y2={contentHeight}
                    />
                ))}
                {Array.from({ length: page.rows + 1 }, (_, row) => (
                    <line
                        key={`h-${row}`}
                        className="notebook-svg-grid-line"
                        x1="0"
                        y1={row * page.cellSizeMm}
                        x2={contentWidth}
                        y2={row * page.cellSizeMm}
                    />
                ))}
                {cells.map((cell, index) => {
                    if (cell.kind === 'line') {
                        return (
                            <line
                                key={`line-${cell.row}-${cell.col}-${index}`}
                                className="notebook-svg-answer-line"
                                x1={cell.col * page.cellSizeMm}
                                y1={cell.row * page.cellSizeMm}
                                x2={(cell.col + 1) * page.cellSizeMm}
                                y2={cell.row * page.cellSizeMm}
                            />
                        );
                    }

                    return (
                        <g key={`text-${cell.row}-${cell.col}-${index}`}>
                            <text
                                className={`notebook-svg-${cell.kind}`}
                                x={cell.col * page.cellSizeMm + page.cellSizeMm / 2}
                                y={cell.row * page.cellSizeMm + page.cellSizeMm * 0.68}
                                textAnchor={textAnchor(cell)}
                            >
                                {cell.value}
                            </text>
                            {cell.decimalSeparatorAfter && (
                                <text
                                    className="notebook-svg-decimal-separator"
                                    x={cell.col * page.cellSizeMm + 3.97}
                                    y={cell.row * page.cellSizeMm + 5.3}
                                    textAnchor="start"
                                >
                                    ,
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}
