import React, { useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, useExerciseStore } from '../store/exerciseStore';
import './SettingsScreen.css';

const AGE_HINTS = {
    6: 'Счет в пределах 10, простое сложение и вычитание, сравнение чисел, работа с составом числа.',
    7: 'Сложение и вычитание в пределах 20, переход через десяток, простые текстовые задачи.',
    8: 'Сложение и вычитание двузначных чисел, первые примеры на умножение и деление.',
    9: 'Таблица умножения, деление нацело, многозначные вычисления без сложных дробей.',
    10: 'Уверенные действия с многозначными числами, умножение, деление и первые десятичные числа.'
};

const AGE_OPTIONS = [6, 7, 8, 9, 10];

const cloneDefaultSettings = () => ({
    addition: { ...DEFAULT_SETTINGS.addition },
    subtraction: { ...DEFAULT_SETTINGS.subtraction },
    multiplication: { ...DEFAULT_SETTINGS.multiplication },
    division: { ...DEFAULT_SETTINGS.division }
});

export function SettingsScreen({ onGenerate }) {
    const { settings, setSettings } = useExerciseStore();
    const [selectedAge, setSelectedAge] = useState(6);

    const summary = useMemo(() => {
        const enabledOperations = Object.values(settings).filter(operation => operation.enabled);
        const examplesCount = enabledOperations.reduce((total, operation) => total + Number(operation.count || 0), 0);

        return {
            operationsCount: enabledOperations.length,
            examplesCount
        };
    }, [settings]);

    const handleToggle = (operation) => {
        setSettings(prev => ({
            ...prev,
            [operation]: {
                ...prev[operation],
                enabled: !prev[operation].enabled
            }
        }));
    };

    const handleChange = (operation, field, value) => {
        const parsedValue = parseInt(value) || value;

        setSettings(prev => ({
            ...prev,
            [operation]: {
                ...prev[operation],
                [field]: parsedValue,
                ...(operation === 'subtraction'
                    && field === 'minuendDigits'
                    && prev.subtraction.subtrahendDigits > parsedValue
                    ? { subtrahendDigits: parsedValue }
                    : {}),
                ...(operation === 'multiplication'
                    && field === 'firstDigits'
                    && prev.multiplication.secondDigits > parsedValue
                    ? { secondDigits: parsedValue }
                    : {})
            }
        }));
    };

    const handleReset = () => {
        setSelectedAge(6);
        setSettings(cloneDefaultSettings());
    };

    const handleGenerate = () => {
        onGenerate(settings);
    };

    const renderCardClassName = (operation) => (
        `operation-card ${settings[operation].enabled ? 'active' : 'inactive'}`
    );

    return (
        <div className="screen active settings-screen">
            <header className="settings-header">
                <div>
                    <p className="settings-kicker">Генератор заданий</p>
                    <h1>Быстрая настройка</h1>
                    <p className="settings-subtitle">Выберите возраст и настройте операции вручную</p>
                </div>
            </header>

            <section className="preset-panel" aria-label="Готовые настройки">
                <label htmlFor="agePreset">Готовые настройки:</label>
                <select
                    id="agePreset"
                    value={selectedAge}
                    onChange={(event) => setSelectedAge(Number(event.target.value))}
                >
                    {AGE_OPTIONS.map(age => (
                        <option key={age} value={age}>{age} лет</option>
                    ))}
                </select>
            </section>

            <section className="operations-grid" aria-label="Операции">
                <article className={renderCardClassName('addition')}>
                    <OperationHeader
                        id="additionEnabled"
                        enabled={settings.addition.enabled}
                        symbol="+"
                        title="Сложение"
                        onToggle={() => handleToggle('addition')}
                    />
                    <div className="operation-settings compact">
                        <SettingGroup label="Количество">
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={settings.addition.count}
                                disabled={!settings.addition.enabled}
                                onChange={(event) => handleChange('addition', 'count', event.target.value)}
                            />
                        </SettingGroup>
                        <SettingGroup label="Разрядность">
                            <select
                                value={settings.addition.digits}
                                disabled={!settings.addition.enabled}
                                onChange={(event) => handleChange('addition', 'digits', event.target.value)}
                            >
                                <option value="1">Однозначные (1-9)</option>
                                <option value="2">Двузначные (10-99)</option>
                                <option value="3">Трехзначные (100-999)</option>
                                <option value="4">Четырехзначные (1000-9999)</option>
                            </select>
                        </SettingGroup>
                        <SettingGroup label="Слагаемых">
                            <select
                                value={settings.addition.terms}
                                disabled={!settings.addition.enabled}
                                onChange={(event) => handleChange('addition', 'terms', event.target.value)}
                            >
                                <option value="2">2</option>
                                <option value="3">3</option>
                                <option value="4">4</option>
                                <option value="5">5</option>
                            </select>
                        </SettingGroup>
                        <label className="inline-checkbox">
                            <input
                                type="checkbox"
                                checked={settings.addition.useDecimals}
                                disabled={!settings.addition.enabled}
                                onChange={(event) => handleChange('addition', 'useDecimals', event.target.checked)}
                            />
                            <span>Числа с запятой</span>
                        </label>
                    </div>
                </article>

                <article className={renderCardClassName('subtraction')}>
                    <OperationHeader
                        id="subtractionEnabled"
                        enabled={settings.subtraction.enabled}
                        symbol="−"
                        title="Вычитание"
                        onToggle={() => handleToggle('subtraction')}
                    />
                    <div className="operation-settings compact">
                        <SettingGroup label="Количество">
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={settings.subtraction.count}
                                disabled={!settings.subtraction.enabled}
                                onChange={(event) => handleChange('subtraction', 'count', event.target.value)}
                            />
                        </SettingGroup>
                        <SettingGroup label="Уменьшаемое">
                            <select
                                value={settings.subtraction.minuendDigits}
                                disabled={!settings.subtraction.enabled}
                                onChange={(event) => handleChange('subtraction', 'minuendDigits', event.target.value)}
                            >
                                <option value="1">Однозначные (1-9)</option>
                                <option value="2">Двузначные (10-99)</option>
                                <option value="3">Трехзначные (100-999)</option>
                                <option value="4">Четырехзначные (1000-9999)</option>
                            </select>
                        </SettingGroup>
                        <SettingGroup label="Вычитаемое">
                            <select
                                value={settings.subtraction.subtrahendDigits}
                                disabled={!settings.subtraction.enabled}
                                onChange={(event) => handleChange('subtraction', 'subtrahendDigits', event.target.value)}
                            >
                                <option value="1">Однозначные (1-9)</option>
                                <option value="2" disabled={settings.subtraction.minuendDigits < 2}>Двузначные (10-99)</option>
                                <option value="3" disabled={settings.subtraction.minuendDigits < 3}>Трехзначные (100-999)</option>
                                <option value="4" disabled={settings.subtraction.minuendDigits < 4}>Четырехзначные (1000-9999)</option>
                            </select>
                        </SettingGroup>
                        <label className="inline-checkbox">
                            <input
                                type="checkbox"
                                checked={settings.subtraction.useDecimals}
                                disabled={!settings.subtraction.enabled}
                                onChange={(event) => handleChange('subtraction', 'useDecimals', event.target.checked)}
                            />
                            <span>Числа с запятой</span>
                        </label>
                    </div>
                </article>

                <article className={renderCardClassName('multiplication')}>
                    <OperationHeader
                        id="multiplicationEnabled"
                        enabled={settings.multiplication.enabled}
                        symbol="×"
                        title="Умножение"
                        onToggle={() => handleToggle('multiplication')}
                    />
                    <div className="operation-settings compact">
                        <SettingGroup label="Количество">
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={settings.multiplication.count}
                                disabled={!settings.multiplication.enabled}
                                onChange={(event) => handleChange('multiplication', 'count', event.target.value)}
                            />
                        </SettingGroup>
                        <SettingGroup label="Первый множитель">
                            <select
                                value={settings.multiplication.firstDigits}
                                disabled={!settings.multiplication.enabled}
                                onChange={(event) => handleChange('multiplication', 'firstDigits', event.target.value)}
                            >
                                <option value="1">Однозначные (1-9)</option>
                                <option value="2">Двузначные (10-99)</option>
                                <option value="3">Трехзначные (100-999)</option>
                            </select>
                        </SettingGroup>
                        <SettingGroup label="Второй множитель">
                            <select
                                value={settings.multiplication.secondDigits}
                                disabled={!settings.multiplication.enabled}
                                onChange={(event) => handleChange('multiplication', 'secondDigits', event.target.value)}
                            >
                                <option value="1">Однозначные (1-9)</option>
                                <option value="2" disabled={settings.multiplication.firstDigits < 2}>Двузначные (10-99)</option>
                                <option value="3" disabled={settings.multiplication.firstDigits < 3}>Трехзначные (100-999)</option>
                            </select>
                        </SettingGroup>
                    </div>
                </article>

                <article className={renderCardClassName('division')}>
                    <OperationHeader
                        id="divisionEnabled"
                        enabled={settings.division.enabled}
                        symbol="÷"
                        title="Деление"
                        onToggle={() => handleToggle('division')}
                    />
                    <div className="operation-settings compact">
                        <SettingGroup label="Количество">
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={settings.division.count}
                                disabled={!settings.division.enabled}
                                onChange={(event) => handleChange('division', 'count', event.target.value)}
                            />
                        </SettingGroup>
                        <SettingGroup label="Делимое">
                            <select
                                value={settings.division.dividendDigits}
                                disabled={!settings.division.enabled}
                                onChange={(event) => handleChange('division', 'dividendDigits', event.target.value)}
                            >
                                <option value="2">Двузначные (10-99)</option>
                                <option value="3">Трехзначные (100-999)</option>
                                <option value="4">Четырехзначные (1000-9999)</option>
                            </select>
                        </SettingGroup>
                        <SettingGroup label="Делитель">
                            <select
                                value={settings.division.divisorDigits}
                                disabled={!settings.division.enabled}
                                onChange={(event) => handleChange('division', 'divisorDigits', event.target.value)}
                            >
                                <option value="1">Однозначные (1-9)</option>
                                <option value="2">Двузначные (10-99)</option>
                            </select>
                        </SettingGroup>
                    </div>
                </article>
            </section>

            <section className="hint-panel" aria-live="polite">
                <div className="hint-icon" aria-hidden="true">i</div>
                <div>
                    <h2>Подсказка</h2>
                    <p>Для {selectedAge} лет: {AGE_HINTS[selectedAge]}</p>
                </div>
            </section>

            <footer className="settings-footer">
                <button type="button" className="btn-secondary" onClick={handleReset}>
                    Сбросить настройки
                </button>
                <div className="settings-summary" aria-live="polite">
                    <p>Будет создано: <strong>{summary.examplesCount}</strong> примеров</p>
                    <span>Выбрано операций: {summary.operationsCount}</span>
                </div>
                <button type="button" className="btn-primary" onClick={handleGenerate}>
                    Создать примеры
                </button>
            </footer>
        </div>
    );
}

function OperationHeader({ id, enabled, symbol, title, onToggle }) {
    return (
        <div className="operation-header">
            <label className="operation-check" htmlFor={id}>
                <input
                    type="checkbox"
                    id={id}
                    checked={enabled}
                    onChange={onToggle}
                />
                <span aria-hidden="true" />
            </label>
            <span className="operation-symbol" aria-hidden="true">{symbol}</span>
            <label className="operation-title" htmlFor={id}>{title}</label>
            <button
                type="button"
                className="operation-toggle"
                aria-label={`${enabled ? 'Выключить' : 'Включить'} ${title.toLowerCase()}`}
                aria-pressed={enabled}
                onClick={onToggle}
            >
                <span />
            </button>
        </div>
    );
}

function SettingGroup({ label, children }) {
    return (
        <label className="setting-group">
            <span>{label}</span>
            {children}
        </label>
    );
}
