import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const worksheetExamples = [
    { top: '48', operator: '+', bottom: '27' },
    { top: '93', operator: '-', bottom: '58' },
    { top: '124', operator: '+', bottom: '236' },
    { top: '72', operator: ':', bottom: '8' },
    { top: '306', operator: '-', bottom: '179' },
    { top: '37', operator: 'x', bottom: '6' },
    { top: '450', operator: '+', bottom: '125' },
    { top: '84', operator: ':', bottom: '7' },
    { top: '208', operator: '-', bottom: '96' },
    { top: '19', operator: 'x', bottom: '5' },
    { top: '700', operator: '-', bottom: '284' },
    { top: '56', operator: '+', bottom: '38' }
];

const page = {
    label: 'Teacher command',
    eyebrow: 'Быстрый выпуск раздатки',
    headline: 'Раздаточные листы для урока без вечерней подготовки',
    lead: 'Выберите операции, диапазон чисел и количество заданий. Генератор соберет аккуратный лист с примерами, который можно сразу распечатать для занятия.',
    cta: 'Создать лист',
    secondaryCta: 'Как это работает',
    visualTitle: 'Практика на сегодня',
    visualCaption: 'рабочая сцена / готовый материал',
    visualNote: 'A4 · тетрадная сетка · ответы по желанию',
    metrics: [
        ['2 минуты', 'на подготовку вместо ручного набора и выравнивания'],
        ['4 операции', 'сложение, вычитание, умножение и деление'],
        ['A4', 'готовый формат для обычной домашней или школьной печати']
    ],
    problemTitle: 'Когда практику надо дать сейчас, ручная верстка только мешает',
    problemText: 'Открыть документ, придумать примеры, выровнять столбики, проверить, что все влезло на лист. Для одной тренировки это слишком много мелкой работы.',
    problemPoints: [
        'не нужно набирать задания вручную',
        'не нужно искать подходящий PDF',
        'не нужно заново верстать лист под каждую тему'
    ],
    benefitsTitle: 'Что получает взрослый, который готовит задания',
    benefits: [
        ['Быстрый старт', 'Сначала задаете параметры, затем сразу переходите к готовому листу.'],
        ['Настройка под уровень', 'Меняйте операции, диапазоны чисел, количество примеров и формат вывода.'],
        ['Печатный результат', 'Лист рассчитан на обычную печать и практику в тетради или на бумаге.']
    ],
    stepsTitle: 'От темы урока до печати',
    steps: [
        ['01', 'Выберите навык', 'Отметьте сложение, вычитание, умножение или деление.'],
        ['02', 'Задайте сложность', 'Укажите диапазоны, разрядность и количество примеров.'],
        ['03', 'Распечатайте лист', 'Получите готовые задания и, если нужно, блок с ответами.']
    ],
    useTitle: 'Подходит для разных сценариев',
    useCases: [
        ['Дома', 'Короткая тренировка после школы без долгой подготовки.'],
        ['На уроке', 'Раздаточный лист для закрепления темы.'],
        ['У репетитора', 'Быстрая подборка заданий под конкретного ученика.']
    ],
    faqTitle: 'Перед стартом',
    faqs: [
        ['Нужно регистрироваться?', 'Нет. Можно перейти в генератор и сразу собрать лист.'],
        ['Можно менять сложность?', 'Да. Настройки помогают подобрать задания под текущий уровень.'],
        ['Это только для начальной школы?', 'Лучше всего подходит для базовой арифметики и регулярной практики вычислений.']
    ],
    finalTitle: 'Соберите первый лист и оцените, сколько времени это экономит',
    finalText: 'Начните с простого набора примеров, затем усложните параметры под ребенка, класс или ученика.'
};

function WorksheetPreview({ title, note }) {
    return (
        <div
            aria-label="Пример печатного листа A4 с математическими заданиями в тетрадной сетке"
            className="home-preview home-preview-command"
            role="img"
        >
            <div aria-hidden="true">
                <div className="home-preview-toolbar">
                    <span />
                    <span />
                    <span />
                </div>
                <div className="home-preview-paper">
                    <div className="home-preview-topline">
                        <span>{title}</span>
                        <span>Дата: _______</span>
                    </div>
                    <div className="home-preview-grid">
                        {worksheetExamples.map((example, index) => (
                            <div className="home-worksheet-example" key={`${example.top}-${index}`}>
                                <div className="home-worksheet-top">{example.top}</div>
                                <div className="home-worksheet-bottom">
                                    <span>{example.operator}</span>
                                    <strong>{example.bottom}</strong>
                                </div>
                                <div className="home-worksheet-line" />
                            </div>
                        ))}
                    </div>
                    <div className="home-preview-note">{note}</div>
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ eyebrow, title, text }) {
    return (
        <div className="home-section-heading">
            {eyebrow && <p>{eyebrow}</p>}
            <h2>{title}</h2>
            {text && <span>{text}</span>}
        </div>
    );
}

function MetricStrip({ metrics }) {
    return (
        <section className="home-metrics" aria-label="Ключевые преимущества">
            {metrics.map(([value, label]) => (
                <div className="home-metric" key={value}>
                    <strong>{value}</strong>
                    <span>{label}</span>
                </div>
            ))}
        </section>
    );
}

function HomeCardList({ items, className = '' }) {
    return (
        <div className={`home-card-list ${className}`}>
            {items.map(([title, text], index) => (
                <article className="home-card" key={title}>
                    <span className="home-card-index" aria-hidden="true">0{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                </article>
            ))}
        </div>
    );
}

function Steps({ steps }) {
    return (
        <div className="home-steps">
            {steps.map(([number, title, text]) => (
                <article className="home-step" key={title}>
                    <span aria-hidden="true">{number}</span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                </article>
            ))}
        </div>
    );
}

function Faqs({ faqs }) {
    return (
        <div className="home-faq-list">
            {faqs.map(([question, answer]) => (
                <details className="home-faq" key={question}>
                    <summary>{question}</summary>
                    <p>{answer}</p>
                </details>
            ))}
        </div>
    );
}

export function HomePage() {
    return (
        <article className="home-page">
            <section className="home-hero">
                <div className="home-hero-copy">
                    <p className="home-kicker">{page.label}</p>
                    <p className="home-eyebrow">{page.eyebrow}</p>
                    <h1>{page.headline}</h1>
                    <p className="home-lead">{page.lead}</p>
                    <div className="home-actions">
                        <Link className="home-primary" to="/generator">{page.cta}</Link>
                        <Link className="home-secondary" to="/how-it-works">{page.secondaryCta}</Link>
                    </div>
                </div>
                <div className="home-hero-visual">
                    <span className="home-visual-caption">{page.visualCaption}</span>
                    <WorksheetPreview title={page.visualTitle} note={page.visualNote} />
                </div>
            </section>

            <MetricStrip metrics={page.metrics} />

            <section className="home-problem">
                <SectionHeader title={page.problemTitle} text={page.problemText} />
                <ul>
                    {page.problemPoints.map((point) => (
                        <li key={point}>{point}</li>
                    ))}
                </ul>
            </section>

            <section className="home-section home-benefits">
                <SectionHeader eyebrow="Преимущества" title={page.benefitsTitle} />
                <HomeCardList items={page.benefits} />
            </section>

            <section className="home-section home-workflow">
                <SectionHeader eyebrow="Процесс" title={page.stepsTitle} />
                <Steps steps={page.steps} />
            </section>

            <section className="home-section home-scenarios">
                <SectionHeader eyebrow="Сценарии" title={page.useTitle} />
                <HomeCardList items={page.useCases} className="home-use-cases" />
            </section>

            <section className="home-section home-faq-section">
                <SectionHeader eyebrow="Перед стартом" title={page.faqTitle} />
                <Faqs faqs={page.faqs} />
            </section>

            <section className="home-final-cta">
                <div>
                    <p>Готовый лист без лишней подготовки</p>
                    <h2>{page.finalTitle}</h2>
                    <span>{page.finalText}</span>
                </div>
                <Link className="home-primary" to="/generator">{page.cta}</Link>
            </section>
        </article>
    );
}
