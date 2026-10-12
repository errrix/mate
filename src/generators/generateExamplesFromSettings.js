import { generateAddition } from './additionGenerator';
import { generateSubtraction } from './subtractionGenerator';
import { generateMultiplication } from './multiplicationGenerator';
import { generateDivision } from './divisionGenerator';
import { createSeededRandom } from './numberUtils';

export const MAX_EXAMPLES_PER_OPERATION = 100;

export function normalizeCount(value) {
    const count = Math.floor(Number(value));

    if (!Number.isFinite(count)) {
        return 0;
    }

    return Math.min(Math.max(count, 0), MAX_EXAMPLES_PER_OPERATION);
}

export function hasEnabledOperation(settings) {
    return Object.values(settings).some((operationSettings) => operationSettings.enabled);
}

export function generateExamplesFromSettings(settings, seed) {
    const generatedExamples = [];
    const random = seed === undefined ? Math.random : createSeededRandom(seed);

    if (settings.addition.enabled) {
        generatedExamples.push(...generateAddition(
            normalizeCount(settings.addition.count),
            settings.addition.digits,
            settings.addition.terms,
            settings.addition.useDecimals && !settings.addition.limit,
            { limit: settings.addition.limit, random }
        ));
    }

    if (settings.subtraction.enabled) {
        generatedExamples.push(...generateSubtraction(
            normalizeCount(settings.subtraction.count),
            settings.subtraction.minuendDigits,
            settings.subtraction.subtrahendDigits,
            settings.subtraction.useDecimals && !settings.subtraction.limit,
            { limit: settings.subtraction.limit, random }
        ));
    }

    if (settings.multiplication.enabled) {
        generatedExamples.push(...generateMultiplication(
            normalizeCount(settings.multiplication.count),
            settings.multiplication.firstDigits,
            settings.multiplication.secondDigits,
            { random }
        ));
    }

    if (settings.division.enabled) {
        generatedExamples.push(...generateDivision(
            normalizeCount(settings.division.count),
            settings.division.dividendDigits,
            settings.division.divisorDigits,
            { random }
        ));
    }

    return generatedExamples;
}
