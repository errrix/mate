import { describe, expect, test } from 'vitest';
import { generateExamplesFromSettings } from '../generators/generateExamplesFromSettings';
import { AGE_OPTIONS, applyAgePreset, findMatchingAge } from './agePresets';
import { DEFAULT_SETTINGS } from './exerciseStore';

describe('age presets', () => {
    test.each(AGE_OPTIONS)('preset for age %i applies, is recognized and generates examples', (age) => {
        const settings = applyAgePreset(DEFAULT_SETTINGS, age);

        expect(findMatchingAge(settings)).toBe(age);
        expect(generateExamplesFromSettings(settings).length).toBeGreaterThan(0);
    });

    test('keeps options and ignores unknown ages', () => {
        const settings = { ...DEFAULT_SETTINGS, options: { printAnswers: true } };

        expect(applyAgePreset(settings, 8).options).toEqual({ printAnswers: true });
        expect(applyAgePreset(settings, 42)).toBe(settings);
    });

    test('reports no age for default or manually changed settings', () => {
        const changed = applyAgePreset(DEFAULT_SETTINGS, 8);

        expect(findMatchingAge(DEFAULT_SETTINGS)).toBeNull();
        expect(findMatchingAge({
            ...changed,
            addition: { ...changed.addition, digits: 4 }
        })).toBeNull();
    });
});
