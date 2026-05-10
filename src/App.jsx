import React, { useState } from 'react';
import { SettingsScreen } from './components/SettingsScreen';
import { ExamplesScreen } from './components/ExamplesScreen';
import { generateAddition } from './generators/additionGenerator';
import { generateSubtraction } from './generators/subtractionGenerator';
import { generateMultiplication } from './generators/multiplicationGenerator';
import { generateDivision } from './generators/divisionGenerator';
import './App.css';

function App() {
    const [currentScreen, setCurrentScreen] = useState('settings');
    const [examples, setExamples] = useState([]);

    const handleGenerate = (settings) => {
        const generatedExamples = [];

        // Генерация примеров на сложение
        if (settings.addition.enabled) {
            const additionExamples = generateAddition(
                settings.addition.count,
                settings.addition.digits,
                settings.addition.terms
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

        if (generatedExamples.length === 0) {
            alert('Выберите хотя бы одну операцию!');
            return;
        }

        setExamples(generatedExamples);
        setCurrentScreen('examples');
    };

    const handleBack = () => {
        setCurrentScreen('settings');
    };

    return (
        <div className="container">
            {currentScreen === 'settings' && (
                <SettingsScreen onGenerate={handleGenerate} />
            )}
            {currentScreen === 'examples' && (
                <ExamplesScreen examples={examples} onBack={handleBack} />
            )}
        </div>
    );
}

export default App;
