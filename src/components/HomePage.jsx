import React from 'react';
import { Link, NavLink } from 'react-router-dom';
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
        icon: 'target',
        title: 'Подходит для разных возрастов и уровней'
    },
    {
        icon: 'grid',
        title: 'Аккуратная тетрадная сетка 7 мм'
    },
    {
        icon: 'sliders',
        title: 'Настройте примеры под задачу'
    },
    {
        icon: 'printer',
        title: 'Печать в один клик, экономия бумаги'
    }
];

function LogoMark() {
    return (
        <span className="home-logo-mark" aria-hidden="true">
            <span />
        </span>
    );
}

function WorksheetExample({ top, operator, bottom }) {
    return (
        <div className="worksheet-example">
            <div className="worksheet-top">{top}</div>
            <div className="worksheet-bottom">
                <span>{operator}</span>
                <strong>{bottom}</strong>
            </div>
            <div className="worksheet-line" />
        </div>
    );
}

function WorksheetPreview() {
    return (
        <div className="desk-scene" aria-label="Пример печатного листа">
            <div className="desk-plant" aria-hidden="true" />
            <div className="desk-eraser" aria-hidden="true" />
            <div className="desk-pencil" aria-hidden="true" />
            <div className="worksheet-paper">
                <div className="worksheet-header">
                    <span>Сложение и вычитание в столбик</span>
                    <span>Дата: __________</span>
                </div>
                <div className="worksheet-grid">
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
    return <span className={`feature-icon feature-icon-${type}`} aria-hidden="true" />;
}

function HeroSection() {
    return (
        <section className="home-hero">
            <div className="home-hero-copy">
                <h1>Печатные задания по математике</h1>
                <p className="home-lead">
                    Генерируйте примеры на сложение, вычитание и умножение в столбик.
                    Удобная настройка, понятный результат и аккуратная тетрадная сетка
                    для печати на одном листе A4.
                </p>

                <div className="home-actions">
                    <Link className="home-primary" to="/generator">
                        <span className="button-icon button-icon-doc" aria-hidden="true" />
                        Создать задания
                    </Link>
                    <Link className="home-secondary" to="/generator">
                        <span className="button-icon button-icon-eye" aria-hidden="true" />
                        Пример листа
                    </Link>
                </div>

                <div className="home-highlights">
                    <div>
                        <span className="mini-icon mini-icon-print" aria-hidden="true" />
                        <p><strong>Готово к печати</strong>A4, тетрадная сетка 7 мм</p>
                    </div>
                    <div>
                        <span className="mini-icon mini-icon-sliders" aria-hidden="true" />
                        <p><strong>Гибкие настройки</strong>уровень, диапазоны, количество</p>
                    </div>
                    <div>
                        <span className="mini-icon mini-icon-check" aria-hidden="true" />
                        <p><strong>Экономит время</strong>для учителей и родителей</p>
                    </div>
                </div>
            </div>

            <div className="home-hero-visual">
                <WorksheetPreview />
            </div>
        </section>
    );
}


export function HomePage() {
    return (
        <main className="home-page">
            <header className="home-nav">
                <Link className="home-brand" to="/">
                    <LogoMark />
                    <div>
                        <strong>Математика. Печать заданий</strong>
                        <span>Генератор примеров для школы и дома</span>
                    </div>
                </Link>

                <nav className="home-tabs" aria-label="Основная навигация">
                    <NavLink to="/generator">Генератор</NavLink>
                    <NavLink to="/how-it-works">Как это работает</NavLink>
                    <NavLink to="/faq">FAQ</NavLink>
                </nav>

                <div className="home-nav-extra">
                    <span className="home-sun" aria-hidden="true" />
                    <Link to="/faq">О генераторе</Link>
                </div>
            </header>

            <HeroSection />

            <section className="home-benefits" id="how-it-works">
                <h2>Почему удобно</h2>
                <div className="benefit-list" id="print">
                    {featureItems.map((item) => (
                        <div className="benefit-item" key={item.icon}>
                            <FeatureIcon type={item.icon} />
                            <strong>{item.title}</strong>
                        </div>
                    ))}
                </div>
            </section>

            <span id="about" className="home-anchor" aria-hidden="true" />
        </main>
    );
}
