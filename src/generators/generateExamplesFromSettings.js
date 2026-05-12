import { generateAddition } from './additionGenerator';
import { generateSubtraction } from './subtractionGenerator';
import { generateMultiplication } from './multiplicationGenerator';
import { generateDivision } from './divisionGenerator';

export function hasEnabledOperation(settings) {
    return Object.values(settings).some((operationSettings) => operationSettings.enabled);
}

export function generateExamplesFromSettings(settings) {
    const generatedExamples = [];

    if (settings.addition.enabled) {
        generatedExamples.push(...generateAddition(
            settings.addition.count,
            settings.addition.digits,
            settings.addition.terms,
            settings.addition.useDecimals
        ));
    }

    if (settings.subtraction.enabled) {
        generatedExamples.push(...generateSubtraction(
            settings.subtraction.count,
            settings.subtraction.minuendDigits,
            settings.subtraction.subtrahendDigits,
            settings.subtraction.useDecimals
        ));
    }

    if (settings.multiplication.enabled) {
        generatedExamples.push(...generateMultiplication(
            settings.multiplication.count,
            settings.multiplication.firstDigits,
            settings.multiplication.secondDigits
        ));
    }

    if (settings.division.enabled) {
        generatedExamples.push(...generateDivision(
            settings.division.count,
            settings.division.dividendDigits,
            settings.division.divisorDigits
        ));
    }

    return generatedExamples;
}
