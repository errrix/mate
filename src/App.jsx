import React from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { SettingsScreen } from './components/SettingsScreen';
import { ExamplesScreen } from './components/ExamplesScreen';
import { InfoPage } from './components/InfoPage';
import { hasEnabledOperation } from './generators/generateExamplesFromSettings';
import './App.css';

function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const containerClassName = location.pathname === '/' || location.pathname === '/faq' || location.pathname === '/how-it-works'
        ? 'container container-page'
        : 'container';

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
        <div className={containerClassName}>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/generator" element={<SettingsScreen onGenerate={handleGenerate} />} />
                <Route path="/result-list" element={<ExamplesScreen onBack={handleBack} />} />
                <Route path="/faq" element={<InfoPage type="faq" />} />
                <Route path="/how-it-works" element={<InfoPage type="how-it-works" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
