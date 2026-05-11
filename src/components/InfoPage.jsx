import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './HomePage.css';
import './InfoPage.css';

const pageContent = {
    faq: {
        title: 'FAQ',
        lead: 'Короткие ответы про генератор, печать и настройки листа.',
        items: [
            {
                title: 'Можно печатать сразу на A4?',
                text: 'Да. Лист подготовлен под A4 и тетрадную сетку 7 мм.'
            },
            {
                title: 'Какие операции поддерживаются?',
                text: 'Сейчас доступны сложение, вычитание, умножение и деление.'
            },
            {
                title: 'Что делать, если примеры не помещаются?',
                text: 'Уменьшите количество примеров или разрядность чисел в настройках генератора.'
            }
        ]
    },
    'how-it-works': {
        title: 'Как это работает',
        lead: 'Генератор собирает примеры по выбранным настройкам и раскладывает их по печатной сетке.',
        items: [
            {
                title: '1. Выберите операции',
                text: 'Отметьте сложение, вычитание, умножение или деление.'
            },
            {
                title: '2. Настройте числа',
                text: 'Укажите количество примеров, разрядность и дополнительные параметры.'
            },
            {
                title: '3. Распечатайте лист',
                text: 'После генерации откроется результат на отдельной странице.'
            }
        ]
    }
};

function LogoMark() {
    return (
        <span className="home-logo-mark" aria-hidden="true">
            <span />
        </span>
    );
}

export function InfoPage({ type }) {
    const content = pageContent[type];

    return (
        <main className="home-page info-page">
            <header className="home-nav">
                <Link className="home-brand home-brand-link" to="/">
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
            </header>

            <section className="info-content">
                <h1>{content.title}</h1>
                <p>{content.lead}</p>
                <div className="info-list">
                    {content.items.map((item) => (
                        <article key={item.title} className="info-item">
                            <h2>{item.title}</h2>
                            <p>{item.text}</p>
                        </article>
                    ))}
                </div>
            </section>
        </main>
    );
}
