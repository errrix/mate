import { generateAddition } from './additionGenerator';
import { generateSubtraction } from './subtractionGenerator';
import { generateMultiplication } from './multiplicationGenerator';
import { generateDivision } from './divisionGenerator';

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

export function generateExamplesFromSettings(settings) {
    const generatedExamples = [];

    if (settings.addition.enabled) {
        generatedExamples.push(...generateAddition(
            normalizeCount(settings.addition.count),
            settings.addition.digits,
            settings.addition.terms,
            settings.addition.useDecimals
        ));
    }

    if (settings.subtraction.enabled) {
        generatedExamples.push(...generateSubtraction(
            normalizeCount(settings.subtraction.count),
            settings.subtraction.minuendDigits,
            settings.subtraction.subtrahendDigits,
            settings.subtraction.useDecimals
        ));
    }

    if (settings.multiplication.enabled) {
        generatedExamples.push(...generateMultiplication(
            normalizeCount(settings.multiplication.count),
            settings.multiplication.firstDigits,
            settings.multiplication.secondDigits
        ));
    }

    if (settings.division.enabled) {
        generatedExamples.push(...generateDivision(
            normalizeCount(settings.division.count),
            settings.division.dividendDigits,
            settings.division.divisorDigits
        ));
    }

    return generatedExamples;
}
