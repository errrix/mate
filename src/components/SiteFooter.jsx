import React from 'react';
import { Link } from 'react-router-dom';
import './SiteFooter.css';

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <span>© {new Date().getFullYear()} Математика на сегодня</span>
            <nav aria-label="Дополнительная навигация">
                <Link to="/generator">Генератор</Link>
                <Link to="/how-it-works">Как это работает</Link>
                <Link to="/faq">Вопросы</Link>
            </nav>
        </footer>
    );
}
