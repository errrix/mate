import React, { Suspense } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { SettingsScreen } from './components/SettingsScreen';
import { ExamplesScreen } from './components/ExamplesScreen';
import { InfoPage } from './components/InfoPage';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { hasEnabledOperation } from './generators/generateExamplesFromSettings';
import './App.css';

const NotebookGridVisualTestPage = import.meta.env.DEV
    ? React.lazy(() => import('./features/notebookGrid/NotebookGridVisualTestPage')
        .then((module) => ({ default: module.NotebookGridVisualTestPage })))
    : null;

function App() {
    const navigate = useNavigate();

    const handleGenerate = (settings) => {
        if (!hasEnabledOperation(settings)) {
            alert('Выберите хотя бы одну операцию!');
            return;
        }

        navigate('/result-list');
    };

    const handleBack = () => {
        navigate('/generator');
    };

    return (
        <div className="container">
            <SiteHeader />
            <main className="app-main">
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
                    <Route path="/" element={<HomePage variant="hp3" />} />
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
