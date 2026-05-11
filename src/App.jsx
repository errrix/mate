import React, { useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { HomePage } from './components/HomePage';
import { SettingsScreen } from './components/SettingsScreen';
import { ExamplesScreen } from './components/ExamplesScreen';
import { InfoPage } from './components/InfoPage';
import { generateAddition } from './generators/additionGenerator';
import { generateSubtraction } from './generators/subtractionGenerator';
import { generateMultiplication } from './generators/multiplicationGenerator';
import { generateDivision } from './generators/divisionGenerator';
import './App.css';

function App() {
    const [examples, setExamples] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const containerClassName = location.pathname === '/' || location.pathname === '/faq' || location.pathname === '/how-it-works'
        ? 'container container-page'
        : 'container';

    const handleGenerate = (settings) => {
        const generatedExamples = [];

        try {
            // Генерация примеров на сложение
            if (settings.addition.enabled) {
                const additionExamples = generateAddition(
                    settings.addition.count,
                    settings.addition.digits,
                    settings.addition.terms,
                    settings.addition.useDecimals
                );
                generatedExamples.push(...additionExamples);
            }

            // Генерация примеров на вычитание
            if (settings.subtraction.enabled) {
                const subtractionExamples = generateSubtraction(
                    settings.subtraction.count,
                    settings.subtraction.minuendDigits,
                    settings.subtraction.subtrahendDigits
                );
                generatedExamples.push(...subtractionExamples);
            }

            // Генерация примеров на умножение
            if (settings.multiplication.enabled) {
                const multiplicationExamples = generateMultiplication(
                    settings.multiplication.count,
                    settings.multiplication.firstDigits,
                    settings.multiplication.secondDigits,
                    settings.multiplication.maxResult
                );
                generatedExamples.push(...multiplicationExamples);
            }

            // Генерация примеров на деление
            if (settings.division.enabled) {
                const divisionExamples = generateDivision(
                    settings.division.count,
                    settings.division.dividendDigits,
                    settings.division.divisorDigits
                );
                generatedExamples.push(...divisionExamples);
            }
        } catch (error) {
            alert(error.message);
            return;
        }

        if (generatedExamples.length === 0) {
            alert('Выберите хотя бы одну операцию!');
            return;
        }

        setExamples(generatedExamples);
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
                <Route
                    path="/result-list"
                    element={<ExamplesScreen examples={examples} onBack={handleBack} />}
                />
                <Route path="/faq" element={<InfoPage type="faq" />} />
                <Route path="/how-it-works" element={<InfoPage type="how-it-works" />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
