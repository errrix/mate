import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const SETTINGS_STORAGE_KEY = 'math-examples-generator.settings';
const LEGACY_EXAMPLES_STORAGE_KEY = 'math-examples-generator.examples';

export const DEFAULT_SETTINGS = {
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
        subtrahendDigits: 2,
        useDecimals: false
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
    }
};

const ExerciseStoreContext = createContext(null);

function mergeSettings(defaultSettings, savedSettings) {
    if (!savedSettings || typeof savedSettings !== 'object') {
        return defaultSettings;
    }

    return Object.fromEntries(
        Object.entries(defaultSettings).map(([operation, defaults]) => [
            operation,
            {
                ...defaults,
                ...(savedSettings[operation] && typeof savedSettings[operation] === 'object'
                    ? savedSettings[operation]
                    : {})
            }
        ])
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

    useEffect(() => {
        saveToStorage(SETTINGS_STORAGE_KEY, settings);
    }, [settings]);

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
        setSettings
    }), [settings]);

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
