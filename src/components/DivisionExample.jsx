import React from 'react';
import './ExampleStyles.css';

/**
 * Компонент для отображения примера на деление уголком
 */
export function DivisionExample({ example }) {
    const { dividend, divisor } = example;

    return (
        <div className="example-item">
            <div className="division-example">
                <span className="divisor">{divisor}</span>
                <span className="dividend">{dividend}</span>
                <span className="line"></span>
            </div>
        </div>
    );
}
