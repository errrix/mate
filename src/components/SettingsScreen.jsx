import React, { useMemo, useState } from 'react';
import { DEFAULT_SETTINGS, useExerciseStore } from '../store/exerciseStore';
import { AGE_OPTIONS, applyAgePreset, findMatchingAge } from '../store/agePresets';
import {
    MAX_EXAMPLES_PER_OPERATION,
    generateExamplesFromSettings,
    hasEnabledOperation,
    normalizeCount
} from '../generators/generateExamplesFromSettings';
import { buildNotebookPlacement } from '../features/notebookGrid/placement';
import { pluralize } from '../utils/pluralize';
import './SettingsScreen.css';

const AGE_HINTS = {
    6: 'Счет в пределах 10, простое сложение и вычитание, сравнение чисел, работа с составом числа.',
    7: 'Сложение и вычитание в пределах 20, переход через десяток, простые текстовые задачи.',
    8: 'Сложение и вычитание двузначных чисел, первые примеры на умножение и деление.',
    9: 'Таблица умножения, деление нацело, многозначные вычисления без сложных дробей.',
    10: 'Уверенные действия с многозначными числами, умножение, деление и первые десятичные числа.'
};

const CUSTOM_SETTINGS_HINT = 'Выберите возраст, чтобы подставить готовые настройки, или настройте операции вручную.';

const cloneDefaultSettings = () => ({
    addition: { ...DEFAULT_SETTINGS.addition },
    subtraction: { ...DEFAULT_SETTINGS.subtraction },
    multiplication: { ...DEFAULT_SETTINGS.multiplication },
    division: { ...DEFAULT_SETTINGS.division },
    options: { ...DEFAULT_SETTINGS.options }
});

const LIMIT_OPTION_PREFIX = 'limit-';

const OPERATIONS = ['addition', 'subtraction', 'multiplication', 'division'];

const isDefaultOperations = (settings) => OPERATIONS.every((operation) => (
    JSON.stringify(settings[operation]) === JSON.stringify(DEFAULT_SETTINGS[operation])
));

const OPERATION_SIGNS = {
    addition: '+',
    subtraction: '−',
    multiplication: '×',
    division: ':'
};

// One example per enabled operation, so the cards show what the current settings produce.
function buildSamples(settings, seed) {
    const operations = Object.keys(OPERATION_SIGNS);
    const disabled = Object.fromEntries(operations.map((operation) => [
        operation,
        { ...settings[operation], enabled: false }
    ]));

    return Object.fromEntries(operations.map((operation, index) => {
        if (!settings[operation].enabled) {
            return [operation, ''];
        }

        try {
            const [example] = generateExamplesFromSettings({
                ...settings,
                ...disabled,
                [operation]: { ...settings[operation], count: 1 }
            }, seed + index);
            const numbers = example.numbers ?? [example.dividend, example.divisor];

            return [operation, numbers.join(` ${OPERATION_SIGNS[operation]} `)];
        } catch {
            return [operation, ''];
        }
    }));
}

export function SettingsScreen({ onGenerate }) {
    const { settings, setSettings, seed } = useExerciseStore();
    const [showOperationError, setShowOperationError] = useState(false);
    const selectedAge = useMemo(() => findMatchingAge(settings), [settings]);

    const summary = useMemo(() => {
        const enabledOperations = ['addition', 'subtraction', 'multiplication', 'division']
            .map((operation) => settings[operation])
            .filter(operation => operation.enabled);
        const examplesCount = enabledOperations.reduce((total, operation) => total + normalizeCount(operation.count), 0);
        let pagesCount = 0;

        try {
            const examples = generateExamplesFromSettings(settings, seed);
            pagesCount = buildNotebookPlacement(examples, undefined, {
                printAnswers: settings.options?.printAnswers === true
            }).pages.length;
        } catch {
            pagesCount = 0;
        }

        return {
            operationsCount: enabledOperations.length,
            examplesCount,
            pagesCount
        };
    }, [settings, seed]);

    const samples = useMemo(() => buildSamples(settings, seed), [settings, seed]);

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
        const parsedValue = typeof value === 'boolean' ? value : Number(value);

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

    // The numbers selector mixes digit counts with "within N" limits.
    const handleRangeChange = (operation, field, value) => {
        const limit = value.startsWith(LIMIT_OPTION_PREFIX)
            ? Number(value.slice(LIMIT_OPTION_PREFIX.length))
            : 0;

        setSettings(prev => ({
            ...prev,
            [operation]: { ...prev[operation], limit }
        }));

        if (limit === 0) {
            handleChange(operation, field, value);
        }
    };

    const getRangeValue = (operation, field) => (
        settings[operation].limit
            ? `${LIMIT_OPTION_PREFIX}${settings[operation].limit}`
            : settings[operation][field]
    );

    const handleCountChange = (operation, value) => {
        const parsedCount = parseInt(value, 10);

        setSettings(prev => ({
            ...prev,
            [operation]: {
                ...prev[operation],
                // An empty field stays empty while typing; handleCountBlur restores it.
                count: Number.isNaN(parsedCount)
                    ? ''
                    : Math.min(Math.max(parsedCount, 1), MAX_EXAMPLES_PER_OPERATION)
            }
        }));
    };

    const handleCountBlur = (operation) => {
        setSettings(prev => (
            normalizeCount(prev[operation].count) >= 1
                ? prev
                : { ...prev, [operation]: { ...prev[operation], count: 1 } }
        ));
    };

    const handleOptionChange = (field, value) => {
        setSettings(prev => ({
            ...prev,
            options: {
                ...prev.options,
                [field]: value
            }
        }));
    };

    const handleAgeChange = (value) => {
        setSettings(prev => applyAgePreset(prev, Number(value)));
    };

    const handleReset = () => {
        setSettings(cloneDefaultSettings());
    };

    const handleGenerate = () => {
        if (!hasEnabledOperation(settings)) {
            setShowOperationError(true);
            return;
        }

        onGenerate();
    };

    const renderCardClassName = (operation) => (
        `operation-card ${settings[operation].enabled ? 'active' : 'inactive'}`
    );

    return (
        <div className="screen active settings-screen">
            <header className="settings-header">
                <div>
                    <p className="settings-kicker">генератор заданий</p>
                    <h1>Настройте лист</h1>
                    <p className="settings-subtitle">
                        Выберите возраст — или включите нужные действия и задайте числа сами.
                    </p>
                </div>
            </header>

            <section className="preset-panel" aria-labelledby="agePresetLabel">
                <p id="agePresetLabel">Готовые настройки по возрасту</p>
                <div className="preset-ages" role="group" aria-labelledby="agePresetLabel">
                    {AGE_OPTIONS.map(age => (
                        <button
                            type="button"
                            key={age}
                            className="preset-age"
                            aria-pressed={selectedAge === age}
                            onClick={() => handleAgeChange(age)}
                        >
                            {age} лет
                        </button>
                    ))}
                </div>
                {selectedAge === null && summary.operationsCount > 0 && !isDefaultOperations(settings) && (
                    <span className="preset-custom">свои настройки</span>
                )}
            </section>

            <section className="operations-grid" aria-label="Операции">
                <article className={renderCardClassName('addition')}>
                    <OperationHeader
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
                                max={MAX_EXAMPLES_PER_OPERATION}
                                value={settings.addition.count}
                                disabled={!settings.addition.enabled}
                                onChange={(event) => handleCountChange('addition', event.target.value)}
                                onBlur={() => handleCountBlur('addition')}
                            />
                        </SettingGroup>
                        <SettingGroup label="Числа">
                            <select
                                value={getRangeValue('addition', 'digits')}
                                disabled={!settings.addition.enabled}
                                onChange={(event) => handleRangeChange('addition', 'digits', event.target.value)}
                            >
                                <option value="limit-10">До 10</option>
                                <option value="limit-20">До 20</option>
                                <option value="1">1–9</option>
                                <option value="2">10–99</option>
                                <option value="3">100–999</option>
                                <option value="4">1000–9999</option>
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
                                checked={settings.addition.useDecimals && !settings.addition.limit}
                                disabled={!settings.addition.enabled || settings.addition.limit > 0}
                                onChange={(event) => handleChange('addition', 'useDecimals', event.target.checked)}
                            />
                            <span>Числа с запятой</span>
                        </label>
                    </div>
                    <OperationSample text={samples.addition} />
                </article>

                <article className={renderCardClassName('subtraction')}>
                    <OperationHeader
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
                                max={MAX_EXAMPLES_PER_OPERATION}
                                value={settings.subtraction.count}
                                disabled={!settings.subtraction.enabled}
                                onChange={(event) => handleCountChange('subtraction', event.target.value)}
                                onBlur={() => handleCountBlur('subtraction')}
                            />
                        </SettingGroup>
                        <SettingGroup label="Уменьшаемое">
                            <select
                                value={getRangeValue('subtraction', 'minuendDigits')}
                                disabled={!settings.subtraction.enabled}
                                onChange={(event) => handleRangeChange('subtraction', 'minuendDigits', event.target.value)}
                            >
                                <option value="limit-10">До 10</option>
                                <option value="limit-20">До 20</option>
                                <option value="1">1–9</option>
                                <option value="2">10–99</option>
                                <option value="3">100–999</option>
                                <option value="4">1000–9999</option>
                            </select>
                        </SettingGroup>
                        <SettingGroup label="Вычитаемое">
                            <select
                                value={settings.subtraction.subtrahendDigits}
                                disabled={!settings.subtraction.enabled || settings.subtraction.limit > 0}
                                onChange={(event) => handleChange('subtraction', 'subtrahendDigits', event.target.value)}
                            >
                                <option value="1">1–9</option>
                                <option value="2" disabled={settings.subtraction.minuendDigits < 2}>10–99</option>
                                <option value="3" disabled={settings.subtraction.minuendDigits < 3}>100–999</option>
                                <option value="4" disabled={settings.subtraction.minuendDigits < 4}>1000–9999</option>
                            </select>
                        </SettingGroup>
                        <label className="inline-checkbox">
                            <input
                                type="checkbox"
                                checked={settings.subtraction.useDecimals && !settings.subtraction.limit}
                                disabled={!settings.subtraction.enabled || settings.subtraction.limit > 0}
                                onChange={(event) => handleChange('subtraction', 'useDecimals', event.target.checked)}
                            />
                            <span>Числа с запятой</span>
                        </label>
                    </div>
                    <OperationSample text={samples.subtraction} />
                </article>

                <article className={renderCardClassName('multiplication')}>
                    <OperationHeader
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
                                max={MAX_EXAMPLES_PER_OPERATION}
                                value={settings.multiplication.count}
                                disabled={!settings.multiplication.enabled}
                                onChange={(event) => handleCountChange('multiplication', event.target.value)}
                                onBlur={() => handleCountBlur('multiplication')}
                            />
                        </SettingGroup>
                        <SettingGroup label="Первый множитель">
                            <select
                                value={settings.multiplication.firstDigits}
                                disabled={!settings.multiplication.enabled}
                                onChange={(event) => handleChange('multiplication', 'firstDigits', event.target.value)}
                            >
                                <option value="1">1–9</option>
                                <option value="2">10–99</option>
                                <option value="3">100–999</option>
                            </select>
                        </SettingGroup>
                        <SettingGroup label="Второй множитель">
                            <select
                                value={settings.multiplication.secondDigits}
                                disabled={!settings.multiplication.enabled}
                                onChange={(event) => handleChange('multiplication', 'secondDigits', event.target.value)}
                            >
                                <option value="1">1–9</option>
                                <option value="2" disabled={settings.multiplication.firstDigits < 2}>10–99</option>
                                <option value="3" disabled={settings.multiplication.firstDigits < 3}>100–999</option>
                            </select>
                        </SettingGroup>
                    </div>
                    <OperationSample text={samples.multiplication} />
                </article>

                <article className={renderCardClassName('division')}>
                    <OperationHeader
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
                                max={MAX_EXAMPLES_PER_OPERATION}
                                value={settings.division.count}
                                disabled={!settings.division.enabled}
                                onChange={(event) => handleCountChange('division', event.target.value)}
                                onBlur={() => handleCountBlur('division')}
                            />
                        </SettingGroup>
                        <SettingGroup label="Делимое">
                            <select
                                value={settings.division.dividendDigits}
                                disabled={!settings.division.enabled}
                                onChange={(event) => handleChange('division', 'dividendDigits', event.target.value)}
                            >
                                <option value="2">10–99</option>
                                <option value="3">100–999</option>
                                <option value="4">1000–9999</option>
                            </select>
                        </SettingGroup>
                        <SettingGroup label="Делитель">
                            <select
                                value={settings.division.divisorDigits}
                                disabled={!settings.division.enabled}
                                onChange={(event) => handleChange('division', 'divisorDigits', event.target.value)}
                            >
                                <option value="1">1–9</option>
                                <option value="2">10–99</option>
                            </select>
                        </SettingGroup>
                    </div>
                    <OperationSample text={samples.division} />
                </article>
            </section>

            <section className="hint-panel" aria-live="polite">
                <div>
                    <h2>подсказка</h2>
                    <p>{selectedAge ? `Для ${selectedAge} лет: ${AGE_HINTS[selectedAge]}` : CUSTOM_SETTINGS_HINT}</p>
                </div>
            </section>

            <footer className="settings-footer">
                <button type="button" className="btn-secondary" onClick={handleReset}>
                    Сбросить настройки
                </button>
                <div className="settings-summary" aria-live="polite">
                    {summary.operationsCount === 0 ? (
                        <>
                            <p>Лист пока пустой</p>
                            <span>Выберите возраст или включите действие</span>
                        </>
                    ) : (
                        <>
                            <p>
                                Будет создано: <strong>{summary.examplesCount}</strong>{' '}
                                {pluralize(summary.examplesCount, ['пример', 'примера', 'примеров'])}
                            </p>
                            <span>Листов: {summary.pagesCount}</span>
                            <span>Выбрано операций: {summary.operationsCount}</span>
                        </>
                    )}
                    <label className="settings-print-answers">
                        <input
                            type="checkbox"
                            checked={settings.options?.printAnswers === true}
                            onChange={(event) => handleOptionChange('printAnswers', event.target.checked)}
                        />
                        <span>Печатать ответы</span>
                    </label>
                </div>
                <div className="settings-generate">
                    {showOperationError && summary.operationsCount === 0 && (
                        <p className="settings-error" role="alert">Выберите хотя бы одну операцию</p>
                    )}
                    <button type="button" className="btn-primary" onClick={handleGenerate}>
                        Создать примеры
                    </button>
                </div>
            </footer>
        </div>
    );
}

function OperationHeader({ enabled, symbol, title, onToggle }) {
    return (
        <div className="operation-header">
            <span className="operation-symbol" aria-hidden="true">{symbol}</span>
            <h2 className="operation-title">{title}</h2>
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

function OperationSample({ text }) {
    if (!text) {
        return null;
    }

    return (
        <p className="operation-sample">
            Например: <span>{text}</span>
        </p>
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
