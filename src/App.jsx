import React from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { SettingsScreen } from './components/SettingsScreen';
import { ExamplesScreen } from './components/ExamplesScreen';
import { InfoPage } from './components/InfoPage';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { hasEnabledOperation } from './generators/generateExamplesFromSettings';
import './App.css';

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
