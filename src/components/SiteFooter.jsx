import React from 'react';
import { Link } from 'react-router-dom';
import './SiteFooter.css';

export function SiteFooter() {
    return (
        <footer className="site-footer">
            <span>© 2025 Математика. Печать заданий</span>
            <nav aria-label="Дополнительная навигация">
                <Link to="/faq">Конфиденциальность</Link>
                <Link to="/faq">Условия использования</Link>
            </nav>
        </footer>
    );
}
