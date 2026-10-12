import { DEFAULT_SETTINGS } from './exerciseStore';

const OPERATIONS = ['addition', 'subtraction', 'multiplication', 'division'];

export const AGE_OPTIONS = [6, 7, 8, 9, 10];

// Each preset lists only the enabled operations; the rest stay disabled with default values.
const AGE_PRESET_OPERATIONS = {
    6: {
        addition: { limit: 10, terms: 2 },
        subtraction: { limit: 10 }
    },
    7: {
        addition: { limit: 20, terms: 2 },
        subtraction: { limit: 20 }
    },
    8: {
        addition: { digits: 2, terms: 2, useDecimals: false },
        subtraction: { minuendDigits: 2, subtrahendDigits: 2, useDecimals: false },
        multiplication: { firstDigits: 1, secondDigits: 1 },
        division: { dividendDigits: 2, divisorDigits: 1 }
    },
    9: {
        addition: { digits: 3, terms: 2, useDecimals: false },
        subtraction: { minuendDigits: 3, subtrahendDigits: 3, useDecimals: false },
        multiplication: { firstDigits: 2, secondDigits: 1 },
        division: { dividendDigits: 3, divisorDigits: 1 }
    },
    10: {
        addition: { digits: 3, terms: 2, useDecimals: true },
        subtraction: { minuendDigits: 4, subtrahendDigits: 3, useDecimals: false },
        multiplication: { firstDigits: 3, secondDigits: 2 },
        division: { dividendDigits: 4, divisorDigits: 2 }
    }
};

function getPresetOperation(age, operation) {
    const presetOperation = AGE_PRESET_OPERATIONS[age]?.[operation];

    return presetOperation
        ? { ...DEFAULT_SETTINGS[operation], ...presetOperation, enabled: true }
        : { ...DEFAULT_SETTINGS[operation], enabled: false };
}

export function applyAgePreset(settings, age) {
    if (!AGE_PRESET_OPERATIONS[age]) {
        return settings;
    }

    return {
        ...settings,
        ...Object.fromEntries(OPERATIONS.map((operation) => [operation, getPresetOperation(age, operation)]))
    };
}

function matchesPresetOperation(current, preset) {
    if (!preset.enabled) {
        return current.enabled !== true;
    }

    return Object.entries(preset).every(([field, value]) => current[field] === value);
}

export function findMatchingAge(settings) {
    return AGE_OPTIONS.find((age) => (
        OPERATIONS.every((operation) => (
            matchesPresetOperation(settings[operation], getPresetOperation(age, operation))
        ))
    )) ?? null;
}
