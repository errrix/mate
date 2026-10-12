import React, { Suspense, useEffect, useRef } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { SettingsScreen } from './components/SettingsScreen';
import { ExamplesScreen } from './components/ExamplesScreen';
import { InfoPage } from './components/InfoPage';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { useExerciseStore } from './store/exerciseStore';
import './App.css';

const NotebookGridVisualTestPage = import.meta.env.DEV
    ? React.lazy(() => import('./features/notebookGrid/NotebookGridVisualTestPage')
        .then((module) => ({ default: module.NotebookGridVisualTestPage })))
    : null;

const SITE_NAME = 'Математика на сегодня';

const PAGE_TITLES = {
    '/': `${SITE_NAME} — примеры в столбик для печати`,
    '/generator': `Настройка листа — ${SITE_NAME}`,
    '/result-list': `Лист с примерами — ${SITE_NAME}`,
    '/faq': `Вопросы и ответы — ${SITE_NAME}`,
    '/how-it-works': `Как это работает — ${SITE_NAME}`
};

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const isFullBleedHome = location.pathname === '/';
    const { regenerateExamples } = useExerciseStore();

    const mainRef = useRef(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        document.title = PAGE_TITLES[location.pathname] ?? SITE_NAME;

        // Keyboard and screen reader users continue from the new page, not from the old link.
        if (isFirstRender.current) {
            isFirstRender.current = false;
        } else {
            mainRef.current?.focus({ preventScroll: true });
        }
    }, [location.pathname]);

    const handleGenerate = () => {
        regenerateExamples();
        navigate('/result-list');
    };

    const handleBack = () => {
        navigate('/generator');
    };

    return (
        <div className={`container${isFullBleedHome ? ' container-home-full-bleed' : ''}`}>
            <a className="skip-link" href="#main">К содержимому</a>
            <SiteHeader />
            <main className="app-main" id="main" tabIndex={-1} ref={mainRef}>
                <Routes>
                    {NotebookGridVisualTestPage && (
                        <Route
                            path="/__visual-tests/notebook-grid/:caseName"
                            element={(
                                <Suspense fallback={null}>
                                    <NotebookGridVisualTestPage />
                                </Suspense>
                            )}
                        />
                    )}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/generator" element={<SettingsScreen onGenerate={handleGenerate} />} />
                    <Route path="/result-list" element={<ExamplesScreen onBack={handleBack} />} />
                    <Route path="/faq" element={<InfoPage type="faq" />} />
                    <Route path="/how-it-works" element={<InfoPage type="how-it-works" />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
            <SiteFooter />
        </div>
    );
}

export default App;
