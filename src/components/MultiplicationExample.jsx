import React from 'react';
import './ExampleStyles.css';

/**
 * Компонент для отображения примера на умножение в столбик
 */
export function MultiplicationExample({ example }) {
    const { numbers } = example;
    const operatorSymbol = '×';

    return (
        <div className="example-item">
            <div className="vertical-example">
                {/* Первый множитель */}
                <span className="number">{numbers[0]}</span>
                
                {/* Второй множитель с оператором */}
                <div className="row">
                    <span className="operator">{operatorSymbol}</span>
                    <span className="number">{numbers[1]}</span>
                </div>
                
                {/* Линия под примером */}
                <span className="line"></span>
            </div>
        </div>
    );
}
