import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AGE_OPTIONS, applyAgePreset, isCustomSettings } from '../store/agePresets';
import { useExerciseStore } from '../store/exerciseStore';
import './HomePage.css';

const PREVIEW_COLS = 16;
const PREVIEW_ROWS = 16;

const previewExamples = [
    { col: 1, row: 1, lines: ['48', '27'], operator: '+', answer: '75' },
    { col: 6, row: 1, lines: ['93', '58'], operator: '−', answer: '35' },
    { col: 11, row: 1, lines: ['124', '236'], operator: '+' },
    { col: 1, row: 6, lines: ['37', '6'], operator: '×' },
    { col: 6, row: 6, lines: ['306', '179'], operator: '−' },
    { col: 11, row: 6, lines: ['450', '125'], operator: '+' },
    { col: 1, row: 11, lines: ['64', '19'], operator: '+' },
    { col: 6, row: 11, lines: ['208', '96'], operator: '−' },
    { col: 11, row: 11, lines: ['19', '5'], operator: '×' }
];

const operations = [
    {
        title: 'Сложение',
        text: 'От двух до пяти слагаемых, целые числа или с запятой.',
        cells: buildColumnCells({ col: 1, row: 0, lines: ['248', '75'], operator: '+' })
    },
    {
        title: 'Вычитание',
        text: 'Ответ всегда больше нуля — без отрицательных чисел.',
        cells: buildColumnCells({ col: 1, row: 0, lines: ['306', '179'], operator: '−' })
    },
    {
        title: 'Умножение',
        text: 'От таблицы умножения до трёхзначных множителей.',
        cells: buildColumnCells({ col: 1, row: 0, lines: ['37', '6'], operator: '×' })
    },
    {
        title: 'Деление',
        text: 'Уголком и всегда нацело, без остатка.',
        cells: buildDivisionCells({ col: 1, row: 0, dividend: '84', divisor: '7' })
    }
];

const steps = [
    {
        title: 'Выберите возраст',
        text: 'От 6 до 10 лет — действия и величина чисел подставятся сами. Или настройте всё вручную.'
    },
    {
        title: 'Посмотрите лист',
        text: 'Он на экране такой же, каким выйдет из принтера. Не нравятся примеры — одна кнопка, и будут другие.'
    },
    {
        title: 'Распечатайте',
        text: 'Обычный А4. Ответы можно добавить блоком внизу листа и отрезать по линии.'
    }
];

const facts = [
    ['7 мм', 'клетка, как в школьной тетради'],
    ['А4', 'печатается на любом принтере'],
    ['до 100', 'примеров на каждое действие'],
    ['0', 'регистраций и отправленных данных']
];

// Cells of a column example: right-aligned numbers, the operator before the last one, a line under it.
function buildColumnCells({ col, row, lines, operator, answer }) {
    const width = Math.max(...lines.map((line) => line.length));
    const cells = [];

    lines.forEach((line, lineIndex) => {
        const isLastLine = lineIndex === lines.length - 1;

        [...line.padStart(width)].forEach((char, charIndex) => {
            cells.push({
                col: col + 1 + charIndex,
                row: row + lineIndex,
                value: char.trim(),
                underlined: isLastLine
            });
        });

        if (isLastLine) {
            cells.push({ col, row: row + lineIndex, value: operator, kind: 'operator' });
        }
    });

    if (answer) {
        [...answer.padStart(width)].forEach((char, charIndex) => {
            cells.push({
                col: col + 1 + charIndex,
                row: row + lines.length,
                value: char.trim(),
                kind: 'hand'
            });
        });
    }

    return cells;
}

function buildDivisionCells({ col, row, dividend, divisor }) {
    return [
        ...[...dividend].map((char, index) => ({ col: col + index, row, value: char })),
        ...[...divisor].map((char, index) => ({
            col: col + dividend.length + index,
            row,
            value: char,
            kind: index === 0 ? 'corner' : 'corner-rest'
        })),
        { col: col + dividend.length, row: row + 1, value: '', kind: 'corner-stem' }
    ];
}

function PaperGrid({ cols, rows, cells, className = '' }) {
    return (
        <div
            className={`paper-grid ${className}`}
            style={{ '--paper-cols': cols, '--paper-rows': rows }}
            aria-hidden="true"
        >
            {cells.map((cell) => (
                <span
                    key={`${cell.col}-${cell.row}-${cell.kind ?? 'digit'}`}
                    className={[
                        'paper-cell',
                        cell.kind ? `paper-cell-${cell.kind}` : '',
                        cell.underlined ? 'paper-cell-underlined' : ''
                    ].join(' ').trim()}
                    style={{ gridColumn: cell.col + 1, gridRow: cell.row + 1 }}
                >
                    {cell.value}
                </span>
            ))}
        </div>
    );
}

function SheetPreview() {
    const cells = previewExamples.flatMap(buildColumnCells);

    return (
        <div className="home-sheet-stage">
            <div className="home-sheet home-sheet-back" aria-hidden="true" />
            <div className="home-sheet" role="img" aria-label="Пример листа: девять примеров в столбик на клетчатой бумаге">
                <div className="home-sheet-header" aria-hidden="true">
                    <span>Имя</span>
                    <i className="home-sheet-name">Маша</i>
                    <span>Дата</span>
                    <i />
                </div>
                <PaperGrid cols={PREVIEW_COLS} rows={PREVIEW_ROWS} cells={cells} />
                <span className="home-sheet-check home-sheet-check-first" aria-hidden="true">✓</span>
                <span className="home-sheet-check home-sheet-check-second" aria-hidden="true">✓</span>
                <div className="home-sheet-footer" aria-hidden="true">Лист 1</div>
            </div>
        </div>
    );
}

export function HomePage() {
    const navigate = useNavigate();
    const { settings, setSettings, regenerateExamples, setReplacedSettings } = useExerciseStore();

    const handleQuickStart = (age) => {
        setReplacedSettings(isCustomSettings(settings) ? settings : null);
        setSettings(prev => applyAgePreset(prev, age));
        regenerateExamples();
        navigate('/result-list');
    };

    return (
        <article className="home-page">
            <section className="home-hero">
                <div className="home-shell home-hero-inner">
                    <div className="home-hero-copy">
                        <p className="home-note">математика на сегодня</p>
                        <h1>Примеры в столбик на листе в клетку</h1>
                        <p className="home-lead">
                            Выберите возраст или действия — получится лист А4, расчерченный как тетрадь.
                            Остаётся распечатать и дать ребёнку ручку.
                        </p>
                        <div className="home-actions">
                            <Link className="btn-primary home-cta" to="/generator">Создать лист</Link>
                            <Link className="home-text-link" to="/how-it-works">Как это работает</Link>
                        </div>
                        <div className="home-quick" role="group" aria-labelledby="home-quick-label">
                            <p id="home-quick-label">Или сразу готовый лист по возрасту:</p>
                            <div className="home-quick-ages">
                                {AGE_OPTIONS.map((age) => (
                                    <button
                                        type="button"
                                        key={age}
                                        onClick={() => handleQuickStart(age)}
                                    >
                                        {age} лет
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <SheetPreview />
                </div>
            </section>

            <section className="home-section">
                <div className="home-shell">
                    <h2>Четыре действия, записанные как в тетради</h2>
                    <p className="home-section-lead">
                        Цифры стоят по клеткам, разряд под разрядом. Под каждым примером оставлено место для решения.
                    </p>
                    <div className="home-operations">
                        {operations.map((operation) => (
                            <div className="home-operation" key={operation.title}>
                                <PaperGrid cols={6} rows={3} cells={operation.cells} className="paper-grid-framed" />
                                <h3>{operation.title}</h3>
                                <p>{operation.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="home-section home-section-tinted">
                <div className="home-shell">
                    <h2>От идеи до листа в руках</h2>
                    <ol className="home-steps">
                        {steps.map((step, index) => (
                            <li key={step.title}>
                                <span className="home-step-number" aria-hidden="true">№{index + 1}</span>
                                <h3>{step.title}</h3>
                                <p>{step.text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>

            <section className="home-section">
                <div className="home-shell">
                    <dl className="home-facts">
                        {facts.map(([value, label]) => (
                            <div key={label}>
                                <dt>{value}</dt>
                                <dd>{label}</dd>
                            </div>
                        ))}
                    </dl>
                    <div className="home-final">
                        <div>
                            <h2>Лист на сегодня — через минуту</h2>
                            <p>Настройки сохранятся в браузере, в следующий раз хватит одной кнопки.</p>
                        </div>
                        <Link className="btn-primary home-cta" to="/generator">Создать лист</Link>
                    </div>
                </div>
            </section>
        </article>
    );
}
