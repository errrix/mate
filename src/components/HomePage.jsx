import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const worksheetExamples = [
    { top: '235', operator: '+', bottom: '168' },
    { top: '527', operator: '-', bottom: '389' },
    { top: '743', operator: '-', bottom: '158' },
    { top: '604', operator: '-', bottom: '275' },
    { top: '458', operator: '+', bottom: '376' },
    { top: '289', operator: '+', bottom: '517' },
    { top: '672', operator: '-', bottom: '194' },
    { top: '908', operator: '-', bottom: '583' },
    { top: '125', operator: '+', bottom: '237' },
    { top: '369', operator: '+', bottom: '481' },
    { top: '806', operator: '-', bottom: '327' },
    { top: '730', operator: '-', bottom: '158' },
    { top: '624', operator: '+', bottom: '198' },
    { top: '537', operator: '+', bottom: '286' },
    { top: '451', operator: '-', bottom: '129' },
    { top: '683', operator: '-', bottom: '274' }
];

const featureItems = [
    {
        icon: 'doc',
        title: 'A4 и тетрадная сетка',
        text: 'Выберите формат листа и вид разметки.'
    },
    {
        icon: 'sliders',
        title: 'Гибкие настройки',
        text: 'Количество, разрядность, слагаемые и другие параметры.'
    },
    {
        icon: 'printer',
        title: 'Готово к печати',
        text: 'Аккуратный результат на одном листе. Можно печатать сразу.'
    }
];

function WorksheetExample({ top, operator, bottom }) {
    return (
        <div className="home-worksheet-example">
            <div className="home-worksheet-top">{top}</div>
            <div className="home-worksheet-bottom">
                <span>{operator}</span>
                <strong>{bottom}</strong>
            </div>
            <div className="home-worksheet-line" />
        </div>
    );
}

function WorksheetPreview() {
    return (
        <div className="home-preview" aria-label="Пример печатного листа">
            <div className="home-preview-paper">
                <div className="home-preview-header">
                    <span>Сложение и вычитание в столбик</span>
                    <span>Дата: _________</span>
                </div>
                <div className="home-preview-grid">
                    {worksheetExamples.map((example, index) => (
                        <WorksheetExample
                            key={`${example.top}-${index}`}
                            top={example.top}
                            operator={example.operator}
                            bottom={example.bottom}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

function FeatureIcon({ type }) {
    return <span className={`home-feature-icon home-feature-icon-${type}`} aria-hidden="true" />;
}

export function HomePage() {
    return (
        <section className="home-page">
            <div className="home-copy">
                <p className="home-kicker">Добро пожаловать!</p>
                <h1>Печатные задания по математике</h1>
                <p className="home-lead">
                    Создавайте аккуратные листы с примерами для школы и дома.
                </p>

                <div className="home-actions">
                    <Link className="home-primary" to="/generator">
                        <span className="home-button-icon home-button-icon-doc" aria-hidden="true" />
                        Создать задания
                    </Link>
                    <Link className="home-secondary" to="/how-it-works">
                        <span className="home-button-icon home-button-icon-eye" aria-hidden="true" />
                        Как это работает
                    </Link>
                </div>

                <div className="home-feature-list">
                    {featureItems.map((item) => (
                        <article className="home-feature-item" key={item.icon}>
                            <FeatureIcon type={item.icon} />
                            <div>
                                <h2>{item.title}</h2>
                                <p>{item.text}</p>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            <WorksheetPreview />
        </section>
    );
}
