import React, { useState } from 'react';
import './SettingsScreen.css';

/**
 * Компонент экрана настроек
 */
export function SettingsScreen({ onGenerate }) {
    const [settings, setSettings] = useState({
        addition: {
            enabled: false,
            count: 10,
            digits: 2,
            terms: 2,
            useDecimals: false
        },
        subtraction: {
            enabled: false,
            count: 10,
            minuendDigits: 2,
            subtrahendDigits: 2
        },
        multiplication: {
            enabled: false,
            count: 10,
            firstDigits: 2,
            secondDigits: 2,
            maxResult: 1000
        },
        division: {
            enabled: false,
            count: 10,
            dividendDigits: 3,
            divisorDigits: 1
        }
    });
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
                    : {})
            }
        }));
    };

    const handleGenerate = () => {
        onGenerate(settings);
    };

    return (
        <div className="screen active">
            <h1>Настройка примеров</h1>

            {/* Сложение */}
            <div className={`operation-block ${settings.addition.enabled ? 'active' : ''}`}>
                <div className="operation-header">
                    <input 
                        type="checkbox" 
                        id="additionEnabled"
                        checked={settings.addition.enabled}
                        onChange={() => handleToggle('addition')}
                    />
                    <label htmlFor="additionEnabled">Сложение</label>
                </div>
                <div className="operation-settings">
                    <div className="setting-group">
                        <label>Количество примеров:</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="100" 
                            value={settings.addition.count}
                            onChange={(e) => handleChange('addition', 'count', e.target.value)}
                        />
                    </div>
                    <div className="setting-group">
                        <label>Разрядность чисел:</label>
                        <select 
                            value={settings.addition.digits}
                            onChange={(e) => handleChange('addition', 'digits', e.target.value)}
                        >
                            <option value="1">Однозначные (1-9)</option>
                            <option value="2">Двузначные (10-99)</option>
                            <option value="3">Трехзначные (100-999)</option>
                            <option value="4">Четырехзначные (1000-9999)</option>
                        </select>
                    </div>
                    <div className="setting-group">
                        <label>Количество слагаемых:</label>
                        <select 
                            value={settings.addition.terms}
                            onChange={(e) => handleChange('addition', 'terms', e.target.value)}
                        >
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                            <option value="5">5</option>
                        </select>
                    </div>
                    <div className="setting-group checkbox-setting">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.addition.useDecimals}
                                onChange={(e) => handleChange('addition', 'useDecimals', e.target.checked)}
                            />
                            Числа с запятой
                        </label>
                    </div>
                </div>
            </div>

            {/* Вычитание */}
            <div className={`operation-block ${settings.subtraction.enabled ? 'active' : ''}`}>
                <div className="operation-header">
                    <input 
                        type="checkbox" 
                        id="subtractionEnabled"
                        checked={settings.subtraction.enabled}
                        onChange={() => handleToggle('subtraction')}
                    />
                    <label htmlFor="subtractionEnabled">Вычитание</label>
                </div>
                <div className="operation-settings">
                    <div className="setting-group">
                        <label>Количество примеров:</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="100" 
                            value={settings.subtraction.count}
                            onChange={(e) => handleChange('subtraction', 'count', e.target.value)}
                        />
                    </div>
                    <div className="setting-group">
                        <label>Разрядность уменьшаемого:</label>
                        <select 
                            value={settings.subtraction.minuendDigits}
                            onChange={(e) => handleChange('subtraction', 'minuendDigits', e.target.value)}
                        >
                            <option value="1">Однозначные (1-9)</option>
                            <option value="2">Двузначные (10-99)</option>
                            <option value="3">Трехзначные (100-999)</option>
                            <option value="4">Четырехзначные (1000-9999)</option>
                        </select>
                    </div>
                    <div className="setting-group">
                        <label>Разрядность вычитаемого:</label>
                        <select 
                            value={settings.subtraction.subtrahendDigits}
                            onChange={(e) => handleChange('subtraction', 'subtrahendDigits', e.target.value)}
                        >
                            <option value="1">Однозначные (1-9)</option>
                            <option value="2" disabled={settings.subtraction.minuendDigits < 2}>Двузначные (10-99)</option>
                            <option value="3" disabled={settings.subtraction.minuendDigits < 3}>Трехзначные (100-999)</option>
                            <option value="4" disabled={settings.subtraction.minuendDigits < 4}>Четырехзначные (1000-9999)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Умножение */}
            <div className={`operation-block ${settings.multiplication.enabled ? 'active' : ''}`}>
                <div className="operation-header">
                    <input 
                        type="checkbox" 
                        id="multiplicationEnabled"
                        checked={settings.multiplication.enabled}
                        onChange={() => handleToggle('multiplication')}
                    />
                    <label htmlFor="multiplicationEnabled">Умножение</label>
                </div>
                <div className="operation-settings">
                    <div className="setting-group">
                        <label>Количество примеров:</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="100" 
                            value={settings.multiplication.count}
                            onChange={(e) => handleChange('multiplication', 'count', e.target.value)}
                        />
                    </div>
                    <div className="setting-group">
                        <label>Разрядность первого множителя:</label>
                        <select 
                            value={settings.multiplication.firstDigits}
                            onChange={(e) => handleChange('multiplication', 'firstDigits', e.target.value)}
                        >
                            <option value="1">Однозначные (1-9)</option>
                            <option value="2">Двузначные (10-99)</option>
                            <option value="3">Трехзначные (100-999)</option>
                        </select>
                    </div>
                    <div className="setting-group">
                        <label>Разрядность второго множителя:</label>
                        <select 
                            value={settings.multiplication.secondDigits}
                            onChange={(e) => handleChange('multiplication', 'secondDigits', e.target.value)}
                        >
                            <option value="1">Однозначные (1-9)</option>
                            <option value="2">Двузначные (10-99)</option>
                            <option value="3">Трехзначные (100-999)</option>
                        </select>
                    </div>
                    <div className="setting-group">
                        <label>Максимальный результат:</label>
                        <select 
                            value={settings.multiplication.maxResult}
                            onChange={(e) => handleChange('multiplication', 'maxResult', e.target.value)}
                        >
                            <option value="0">Без ограничений</option>
                            <option value="100">До 100</option>
                            <option value="1000">До 1000</option>
                            <option value="10000">До 10000</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Деление */}
            <div className={`operation-block ${settings.division.enabled ? 'active' : ''}`}>
                <div className="operation-header">
                    <input 
                        type="checkbox" 
                        id="divisionEnabled"
                        checked={settings.division.enabled}
                        onChange={() => handleToggle('division')}
                    />
                    <label htmlFor="divisionEnabled">Деление</label>
                </div>
                <div className="operation-settings">
                    <div className="setting-group">
                        <label>Количество примеров:</label>
                        <input 
                            type="number" 
                            min="1" 
                            max="100" 
                            value={settings.division.count}
                            onChange={(e) => handleChange('division', 'count', e.target.value)}
                        />
                    </div>
                    <div className="setting-group">
                        <label>Разрядность делимого:</label>
                        <select 
                            value={settings.division.dividendDigits}
                            onChange={(e) => handleChange('division', 'dividendDigits', e.target.value)}
                        >
                            <option value="2">Двузначные (10-99)</option>
                            <option value="3">Трехзначные (100-999)</option>
                            <option value="4">Четырехзначные (1000-9999)</option>
                        </select>
                    </div>
                    <div className="setting-group">
                        <label>Разрядность делителя:</label>
                        <select 
                            value={settings.division.divisorDigits}
                            onChange={(e) => handleChange('division', 'divisorDigits', e.target.value)}
                        >
                            <option value="1">Однозначные (1-9)</option>
                            <option value="2">Двузначные (10-99)</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="button-group">
                <button className="btn-primary" onClick={handleGenerate}>
                    Сгенерировать примеры
                </button>
            </div>
        </div>
    );
}
