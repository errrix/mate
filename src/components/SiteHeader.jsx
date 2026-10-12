import React from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './SiteHeader.css';

// On these pages the sheet is already being made, so a second "create" button would do nothing.
const PAGES_WITHOUT_CTA = ['/generator', '/result-list'];

export function SiteHeader() {
    const { pathname } = useLocation();

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
                <NavLink to="/how-it-works">Как это работает</NavLink>
                <NavLink to="/faq">Вопросы</NavLink>
            </nav>

            {!PAGES_WITHOUT_CTA.includes(pathname) && (
                <div className="site-header-actions">
                    <Link className="site-cta" to="/generator">Создать лист</Link>
                </div>
            )}
        </header>
    );
}
