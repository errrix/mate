import React from 'react';
import './ExampleStyles.css';

/**
 * Компонент для отображения примера на сложение в столбик
 */
export function AdditionExample({ example }) {
    const { numbers } = example;
    
    // Преобразуем числа в массивы цифр
    const numberDigits = numbers.map(num => {
        return num.toString().split('').map(Number);
    });
    
    // Находим максимальную длину числа для выравнивания
    const maxLength = Math.max(...numberDigits.map(digits => digits.length));
    
    // Дополняем числа нулями слева для выравнивания
    const alignedDigits = numberDigits.map(digits => {
        const padding = maxLength - digits.length;
        return [...Array(padding).fill(null), ...digits];
    });

    return (
        <div className="example-item">
            <div className="addition-example notebook-paper">
                <table className="addition-table">
                    <tbody>
                        {alignedDigits.map((digits, rowIndex) => (
                            <tr key={rowIndex}>
                                {rowIndex > 0 && (
                                    <td className="operator-cell">+</td>
                                )}
                                {rowIndex === 0 && <td className="operator-cell"></td>}
                                {digits.map((digit, colIndex) => (
                                    <td key={colIndex} className="digit-cell">
                                        {digit !== null ? digit : ''}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        <tr>
                            <td className="operator-cell"></td>
                            <td colSpan={maxLength} className="line-cell"></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
}
