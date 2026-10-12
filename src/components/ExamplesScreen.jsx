import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { NotebookGrid } from '../features/notebookGrid/NotebookGrid';
import { buildNotebookPlacement } from '../features/notebookGrid/placement';
import { useExerciseStore } from '../store/exerciseStore';
import { generateExamplesFromSettings } from '../generators/generateExamplesFromSettings';
import { pluralize } from '../utils/pluralize';
import './ExamplesScreen.css';

export function ExamplesScreen({ onBack }) {
    const { settings, setSettings, seed, regenerateExamples } = useExerciseStore();
    const printAnswers = settings.options?.printAnswers === true;
    const { examples, error } = useMemo(() => {
        try {
            return {
                examples: generateExamplesFromSettings(settings, seed),
                error: null
            };
        } catch (generationError) {
            return {
                examples: [],
                error: generationError
            };
        }
    }, [settings, seed]);
    // All operations share the same sheets; each one starts on a new row band.
    const placement = useMemo(
        () => buildNotebookPlacement(examples, undefined, { printAnswers }),
        [examples, printAnswers]
    );
    const sheetsCount = placement.pages.length;

    const handlePrintAnswersChange = (event) => {
        const { checked } = event.target;

        setSettings(prev => ({
            ...prev,
            options: { ...prev.options, printAnswers: checked }
        }));
    };

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
            <div className="button-group">
                <button type="button" className="btn-primary" onClick={() => window.print()}>
                    Печать
                </button>
                <button type="button" className="btn-secondary" onClick={regenerateExamples}>
                    Другие примеры
                </button>
                <button type="button" className="btn-secondary" onClick={onBack}>
                    Назад к настройкам
                </button>
                <label className="result-print-answers">
                    <input
                        type="checkbox"
                        checked={printAnswers}
                        onChange={handlePrintAnswersChange}
                    />
                    <span>Печатать ответы</span>
                </label>
            </div>
            <p className="result-sheet-count">
                На печать уйдёт {sheetsCount} {pluralize(sheetsCount, ['лист', 'листа', 'листов'])} А4
            </p>
            <NotebookGrid placement={placement} />
        </div>
    );
}
