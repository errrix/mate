import React from 'react';
import { Link } from 'react-router-dom';
import { DivisionExample } from './DivisionExample';
import { NotebookGrid } from '../features/notebookGrid/NotebookGrid';
import './ExamplesScreen.css';

function renderExample(example, index) {
    switch (example.type) {
        case 'division':
            return <DivisionExample key={index} example={example} />;
        default:
            return null;
    }
}

function groupExamples(examples) {
    return examples.reduce((acc, example, index) => {
        if (!acc[example.type]) {
            acc[example.type] = [];
        }
        acc[example.type].push({ example, index });
        return acc;
    }, {});
}

export function ExamplesScreen({ examples, onBack }) {
    const groupedExamples = groupExamples(examples);

    if (examples.length === 0) {
        return (
            <div className="screen active result-empty">
                <h1 className="main-title">Лист ещё не создан</h1>
                <p>Сначала настройте и сгенерируйте задания.</p>
                <Link className="btn-primary result-empty-link" to="/generator">
                    Открыть генератор
                </Link>
            </div>
        );
    }

    return (
        <div className="screen active">
            <h1 className="main-title">Математика</h1>
            {Object.entries(groupedExamples).map(([type, items]) => {
                if (type === 'addition') {
                    return (
                        <NotebookGrid
                            key={type}
                            title="Сложение"
                            items={items}
                            operator="+"
                        />
                    );
                }

                if (type === 'subtraction') {
                    return (
                        <NotebookGrid
                            key={type}
                            title="Вычитание"
                            items={items}
                            operator="−"
                        />
                    );
                }

                if (type === 'multiplication') {
                    return (
                        <NotebookGrid
                            key={type}
                            title="Умножение"
                            items={items}
                            operator="×"
                        />
                    );
                }

                return (
                    <div key={type} className="examples-section">
                        <div className="examples-container">
                            {items.map(({ example, index }) => renderExample(example, index))}
                        </div>
                    </div>
                );
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
