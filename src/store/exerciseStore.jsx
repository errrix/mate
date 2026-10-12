import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { normalizeCount } from '../generators/generateExamplesFromSettings';
import { createSeed } from '../generators/numberUtils';

const SETTINGS_STORAGE_KEY = 'math-examples-generator.settings';
const SEED_STORAGE_KEY = 'math-examples-generator.seed';
const LEGACY_EXAMPLES_STORAGE_KEY = 'math-examples-generator.examples';

// Addition starts enabled so a first visit can create a sheet right away.
export const DEFAULT_SETTINGS = {
    addition: {
        enabled: true,
        count: 10,
        digits: 2,
        terms: 2,
        useDecimals: false,
        limit: 0
    },
    subtraction: {
        enabled: false,
        count: 10,
        minuendDigits: 2,
        subtrahendDigits: 2,
        useDecimals: false,
        limit: 0
    },
    multiplication: {
        enabled: false,
        count: 10,
        firstDigits: 2,
        secondDigits: 2
    },
    division: {
        enabled: false,
        count: 10,
        dividendDigits: 3,
        divisorDigits: 1
    },
    options: {
        printAnswers: false
    }
};

const ExerciseStoreContext = createContext(null);

function mergeSettings(defaultSettings, savedSettings) {
    if (!savedSettings || typeof savedSettings !== 'object') {
        return defaultSettings;
    }

    return Object.fromEntries(
        Object.entries(defaultSettings).map(([operation, defaults]) => {
            const merged = {
                ...defaults,
                ...(savedSettings[operation] && typeof savedSettings[operation] === 'object'
                    ? savedSettings[operation]
                    : {})
            };

            return [
                operation,
                'count' in merged
                    ? { ...merged, count: Math.max(1, normalizeCount(merged.count)) }
                    : merged
            ];
        })
    );
}

function loadSettings() {
    if (typeof window === 'undefined') {
        return DEFAULT_SETTINGS;
    }

    try {
        const savedSettings = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
        return savedSettings
            ? mergeSettings(DEFAULT_SETTINGS, JSON.parse(savedSettings))
            : DEFAULT_SETTINGS;
    } catch {
        return DEFAULT_SETTINGS;
    }
}

// The seed decides which examples a sheet shows, so a reload keeps the same sheet.
function loadSeed() {
    if (typeof window === 'undefined') {
        return createSeed();
    }

    try {
        const savedSeed = JSON.parse(window.localStorage.getItem(SEED_STORAGE_KEY));
        return Number.isInteger(savedSeed) ? savedSeed : createSeed();
    } catch {
        return createSeed();
    }
}

function saveToStorage(key, value) {
    if (typeof window === 'undefined') {
        return;
    }

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage failures so the generator stays usable in restricted browsers.
    }
}

export function ExerciseStoreProvider({ children }) {
    const [settings, setSettings] = useState(loadSettings);
    const [seed, setSeed] = useState(loadSeed);
    // Hand-tuned settings an age preset has just replaced, kept so the generator can offer them back.
    const [replacedSettings, setReplacedSettings] = useState(null);
    const regenerateExamples = useCallback(() => setSeed(createSeed()), []);

    useEffect(() => {
        saveToStorage(SETTINGS_STORAGE_KEY, settings);
    }, [settings]);

    useEffect(() => {
        saveToStorage(SEED_STORAGE_KEY, seed);
    }, [seed]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(LEGACY_EXAMPLES_STORAGE_KEY);
            } catch {
                // Ignore storage cleanup failures in restricted browsers.
            }
        }
    }, []);

    const value = useMemo(() => ({
        settings,
        setSettings,
        seed,
        regenerateExamples,
        replacedSettings,
        setReplacedSettings
    }), [settings, seed, regenerateExamples, replacedSettings]);

    return (
        <ExerciseStoreContext.Provider value={value}>
            {children}
        </ExerciseStoreContext.Provider>
    );
}

export function useExerciseStore() {
    const store = useContext(ExerciseStoreContext);

    if (!store) {
        throw new Error('useExerciseStore must be used within ExerciseStoreProvider');
    }

    return store;
}
