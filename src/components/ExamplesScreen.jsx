import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NotebookGrid } from '../features/notebookGrid/NotebookGrid';
import { useExerciseStore } from '../store/exerciseStore';
import { generateExamplesFromSettings } from '../generators/generateExamplesFromSettings';
import './ExamplesScreen.css';

function groupExamples(examples) {
    return examples.reduce((acc, example, index) => {
        if (!acc[example.type]) {
            acc[example.type] = [];
        }
        acc[example.type].push({ example, index });
        return acc;
    }, {});
}

export function ExamplesScreen({ onBack }) {
    const { settings } = useExerciseStore();
    const { examples, error } = useMemo(() => {
        try {
            return {
                examples: generateExamplesFromSettings(settings),
                error: null
            };
        } catch (generationError) {
            return {
                examples: [],
                error: generationError
            };
        }
    }, [settings]);
    const groupedExamples = groupExamples(examples);

    if (error) {
        return (
            <div className="screen active result-empty">
                <h1 className="main-title">Лист не создан</h1>
                <p>{error.message}</p>
                <Link className="btn-primary result-empty-link" to="/generator">
                    Вернуться к настройкам
                </Link>
            </div>
        );
    }

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

                if (type === 'division') {
                    return (
                        <NotebookGrid
                            key={type}
                            title="Деление"
                            items={items}
                            operator="÷"
                        />
                    );
                }

                return null;
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
