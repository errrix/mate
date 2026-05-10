import React from 'react';
import { AdditionExample } from './AdditionExample';
import { SubtractionExample } from './SubtractionExample';
import { MultiplicationExample } from './MultiplicationExample';
import { DivisionExample } from './DivisionExample';
import './ExamplesScreen.css';

/**
 * Компонент экрана с примерами
 */
export function ExamplesScreen({ examples, onBack }) {
    const renderExample = (example, index) => {
        switch (example.type) {
            case 'addition':
                return <AdditionExample key={index} example={example} />;
            case 'subtraction':
                return <SubtractionExample key={index} example={example} />;
            case 'multiplication':
                return <MultiplicationExample key={index} example={example} />;
            case 'division':
                return <DivisionExample key={index} example={example} />;
            default:
                return null;
        }
    };

    // Группируем примеры по типам
    const groupedExamples = examples.reduce((acc, example, index) => {
        const type = example.type;
        if (!acc[type]) {
            acc[type] = [];
        }
        acc[type].push({ example, index });
        return acc;
    }, {});

    // Функция для разбора примера на цифры (для сложения и вычитания)
    const parseExample = (example) => {
        const { numbers } = example;
        const numberDigits = numbers.map(num => {
            return num.toString().split('').map(Number);
        });
        
        // Находим максимальную длину числа для выравнивания
        const maxLength = Math.max(...numberDigits.map(digits => digits.length));
        
        // Дополняем числа пустыми значениями слева для выравнивания
        const alignedDigits = numberDigits.map(digits => {
            const padding = maxLength - digits.length;
            return [...Array(padding).fill(null), ...digits];
        });
        
        return { alignedDigits, maxLength, numbersCount: numbers.length };
    };

    // Создаем сетку из квадратиков для сложения и вычитания
    const renderNotebookGrid = (items, examplesPerRow = 5, operator = '+') => {
        const gapBetweenRows = 3; // пустых строк между рядами (увеличить отступ)
        const examplesPerColumn = Math.ceil(items.length / examplesPerRow);
        
        // Вычисляем максимальную высоту и ширину примера
        let maxExampleHeight = 0;
        let maxExampleWidth = 0;
        items.forEach(({ example }) => {
            const { numbersCount, maxLength } = parseExample(example);
            maxExampleHeight = Math.max(maxExampleHeight, numbersCount + 1); // +1 для линии
            // Ширина = 1 (оператор) + maxLength (цифры)
            maxExampleWidth = Math.max(maxExampleWidth, 1 + maxLength);
        });
        
        // Вычисляем общее количество колонок для равномерного распределения
        // Используем минимальную ширину для равномерного распределения 5 примеров
        // Каждый пример занимает примерно одинаковую область, но не слишком много
        const colsPerExample = Math.max(maxExampleWidth + 1, 6); // минимум 6 колонок на пример, чтобы поместилось 5 примеров
        const minColsForExamples = examplesPerRow * colsPerExample;
        
        // Вычисляем, сколько колонок нужно для заполнения всей ширины
        // При печати используем физические единицы: A4 ширина 210mm, с учетом полей ~190mm
        // Размер ячейки при печати 6mm, значит максимум ~31 колонка
        const cellSize = 30; // для экрана
        const printCellSizeMm = 6; // размер ячейки при печати в mm
        const printPageWidthMm = 190; // доступная ширина A4 с учетом полей в mm
        const maxPrintCols = Math.floor(printPageWidthMm / printCellSizeMm); // максимум ~31 колонка при печати
        
        const screenCols = Math.ceil(1000 / cellSize); // примерно 33 колонки для экрана
        
        // Определяем доступную ширину (для экрана или печати)
        // Используем максимум из требуемых колонок и доступных, чтобы сетка заполнялась полностью
        // Для печати используем maxPrintCols, для экрана - screenCols
        const availableCols = Math.max(screenCols, maxPrintCols);
        const totalCols = Math.max(minColsForExamples, availableCols);
        
        // Пересчитываем colsPerExample для равномерного распределения по всей ширине
        // Это обеспечивает симметричное заполнение сетки справа
        const actualColsPerExample = Math.floor(totalCols / examplesPerRow);
        
        // Добавляем отступы сверху и снизу по 1 клетке
        const topPadding = 1;
        const bottomPadding = 1;
        const totalRows = topPadding + examplesPerColumn * maxExampleHeight + (examplesPerColumn - 1) * gapBetweenRows + bottomPadding;
        
        const cells = [];
        
        // Создаем все ячейки сетки
        for (let row = 0; row < totalRows; row++) {
            for (let col = 0; col < totalCols; col++) {
                const cellKey = `cell-${row}-${col}`;
                
                // Вычисляем позицию примера в ряду (равномерное распределение)
                const exampleCol = Math.floor(col / actualColsPerExample);
                const adjustedCol = col % actualColsPerExample;
                
                // Вычисляем смещение для центрирования примера в его области
                const exampleStartCol = exampleCol * actualColsPerExample;
                const offsetInExampleArea = adjustedCol;
                // Центрируем пример в его области (actualColsPerExample колонок)
                const centerOffset = Math.floor((actualColsPerExample - maxExampleWidth) / 2);
                const adjustedColInExample = offsetInExampleArea - centerOffset;
                
                // Учитываем отступ сверху (2 клетки)
                const adjustedRowForExamples = row - topPadding;
                
                // Проверяем, находимся ли мы в отступе сверху или снизу
                if (row < topPadding || row >= totalRows - bottomPadding) {
                    // Пустая ячейка в отступе сверху или снизу
                    cells.push(
                        <div key={cellKey} className="notebook-cell"></div>
                    );
                    continue;
                }
                
                // Вычисляем позицию с учетом отступов между рядами
                const exampleRow = Math.floor(adjustedRowForExamples / (maxExampleHeight + gapBetweenRows));
                const adjustedRow = adjustedRowForExamples % (maxExampleHeight + gapBetweenRows);
                
                // Проверяем, не находимся ли мы в отступе между рядами
                if (adjustedRow >= maxExampleHeight) {
                    // Пустая ячейка в отступе между рядами
                    cells.push(
                        <div key={cellKey} className="notebook-cell"></div>
                    );
                    continue;
                }
                
                const exampleIndex = exampleRow * examplesPerRow + exampleCol;
                
                // Сначала проверяем, существует ли пример
                if (exampleCol >= examplesPerRow || exampleIndex >= items.length) {
                    // Пустая ячейка справа от всех примеров или несуществующий пример
                    cells.push(
                        <div key={cellKey} className="notebook-cell"></div>
                    );
                    continue;
                }
                
                // Теперь безопасно получаем пример
                const { example } = items[exampleIndex];
                const { alignedDigits, maxLength, numbersCount } = parseExample(example);
                
                // Вычисляем реальную ширину этого конкретного примера
                const exampleWidth = 1 + maxLength; // 1 для оператора + maxLength для цифр
                
                // Проверяем, находимся ли мы в области этого конкретного примера
                if (adjustedColInExample < 0 || adjustedColInExample >= exampleWidth) {
                    // Пустая ячейка вне примера (в промежутке между примерами или справа от примера)
                    cells.push(
                        <div key={cellKey} className="notebook-cell"></div>
                    );
                    continue;
                }
                
                const localRow = adjustedRow;
                const localCol = adjustedColInExample;
                
                // Проверяем, в какой части примера мы находимся
                if (localRow < numbersCount) {
                    // Строка с числом
                    if (localCol === 0) {
                        // Ячейка для оператора (колонка 0)
                        if (localRow === 0) {
                            // Первая строка - пустая ячейка
                            cells.push(
                                <div key={cellKey} className="notebook-cell"></div>
                            );
                        } else {
                            // Знак оператора для остальных строк
                            cells.push(
                                <div key={cellKey} className="notebook-cell notebook-cell-operator">
                                    {operator}
                                </div>
                            );
                        }
                    } else if (localCol >= 1 && localCol <= maxLength) {
                        // Ячейка для цифры (колонки 1 до maxLength)
                        // alignedDigits содержит цифры с padding слева: [null, null, 1, 2, 3]
                        // Для выравнивания по правому краю: localCol=1 -> последняя цифра (индекс maxLength-1)
                        const digitIndex = maxLength - localCol;
                        const digitRow = alignedDigits[localRow];
                        const digit = digitRow && digitRow[digitIndex] !== undefined ? digitRow[digitIndex] : null;
                        cells.push(
                            <div key={cellKey} className="notebook-cell notebook-cell-digit">
                                {digit !== null && digit !== undefined ? String(digit) : ''}
                            </div>
                        );
                    } else {
                        // Пустая ячейка справа от числа (колонки > maxLength)
                        cells.push(
                            <div key={cellKey} className="notebook-cell"></div>
                        );
                    }
                } else if (localRow === numbersCount) {
                    // Строка с линией
                    if (localCol === 0) {
                        // Пустая ячейка слева
                        cells.push(
                            <div key={cellKey} className="notebook-cell"></div>
                        );
                    } else if (localCol <= maxLength) {
                        // Ячейка с линией
                        cells.push(
                            <div key={cellKey} className="notebook-cell notebook-cell-line"></div>
                        );
                    } else {
                        // Пустая ячейка справа
                        cells.push(
                            <div key={cellKey} className="notebook-cell"></div>
                        );
                    }
                } else {
                    // Пустая ячейка после примера
                    cells.push(
                        <div key={cellKey} className="notebook-cell"></div>
                    );
                }
            }
        }
        
        return (
            <div 
                className="notebook-grid"
                style={{
                    gridTemplateColumns: `repeat(${totalCols}, var(--cell-size, 30px))`,
                    gridTemplateRows: `repeat(${totalRows}, var(--cell-size, 30px))`,
                    width: '100%',
                    maxWidth: '100%',
                    justifyContent: 'stretch'
                }}
            >
                {cells}
            </div>
        );
    };

    return (
        <div className="screen active">
            <h1 className="main-title">Математика</h1>
            {Object.entries(groupedExamples).map(([type, items]) => {
                if (type === 'addition') {
                    // Для сложения используем сетку из квадратиков
                    return (
                        <div key={type} className="notebook-section">
                            <h2 className="notebook-title">Сложение</h2>
                            {renderNotebookGrid(items, 5, '+')}
                        </div>
                    );
                } else if (type === 'subtraction') {
                    // Для вычитания используем сетку из квадратиков
                    return (
                        <div key={type} className="notebook-section">
                            <h2 className="notebook-title">Вычитание</h2>
                            {renderNotebookGrid(items, 5, '−')}
                        </div>
                    );
                } else {
                    // Для остальных операций обычный контейнер
                    return (
                        <div key={type} className="examples-section">
                            <div className="examples-container">
                                {items.map(({ example, index }) => renderExample(example, index))}
                            </div>
                        </div>
                    );
                }
            })}
            <div className="button-group">
                <button className="btn-primary" onClick={() => window.print()}>
                    Печать
                </button>
                <button className="btn-secondary" onClick={onBack}>
                    Назад к настройкам
                </button>
            </div>
        </div>
    );
}
