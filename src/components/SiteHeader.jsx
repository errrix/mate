import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import './SiteHeader.css';

export function SiteHeader() {
    return (
        <header className="site-header">
            <Link className="site-brand" to="/">
                <span className="site-logo-mark" aria-hidden="true">
                    <span />
                </span>
                <span className="site-brand-text">
                    <strong>Математика. Печать заданий</strong>
                    <span>Генератор примеров для школы и дома</span>
                </span>
            </Link>

            <nav className="site-nav" aria-label="Основная навигация">
                <NavLink to="/generator">Генератор</NavLink>
                <NavLink to="/how-it-works">Как это работает</NavLink>
                <NavLink to="/faq">FAQ</NavLink>
                <Link to="/faq">О генераторе</Link>
            </nav>

            <Link className="site-profile-link" to="/generator" aria-label="Перейти к генератору">
                <span aria-hidden="true" />
            </Link>
        </header>
    );
}
