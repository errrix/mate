import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './SiteHeader.css';

export function SiteHeader() {
    return (
        <header className="site-header">
            <Link className="site-brand" to="/">
                <span className="site-logo-mark" aria-hidden="true">=</span>
                <span className="site-brand-text">
                    <strong>Математика на сегодня</strong>
                    <span>короткая практика для дома и занятий</span>
                </span>
            </Link>

            <nav className="site-nav" aria-label="Основная навигация">
                <NavLink to="/how-it-works">Как подготовить лист</NavLink>
                <NavLink to="/faq">Вопросы</NavLink>
            </nav>

            <div className="site-header-actions">
                <span>2 минуты</span>
                <Link className="site-cta" to="/generator">Начать</Link>
            </div>
        </header>
    );
}
