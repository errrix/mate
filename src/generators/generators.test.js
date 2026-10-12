import { describe, expect, test } from 'vitest';
import { generateAddition } from './additionGenerator';
import { generateSubtraction } from './subtractionGenerator';
import { generateMultiplication } from './multiplicationGenerator';
import { generateDivision } from './divisionGenerator';
import {
    MAX_EXAMPLES_PER_OPERATION,
    generateExamplesFromSettings,
    normalizeCount
} from './generateExamplesFromSettings';

function expectDigits(value, digits) {
    const min = 10 ** (digits - 1);
    const max = 10 ** digits - 1;
    expect(value).toBeGreaterThanOrEqual(min);
    expect(value).toBeLessThanOrEqual(max);
}

describe('generateAddition', () => {
    test('creates the requested number of addition examples', () => {
        const examples = generateAddition(12, 2, 3);

        expect(examples).toHaveLength(12);
        for (const example of examples) {
            expect(example.type).toBe('addition');
            expect(example.operator).toBe('+');
            expect(example.numbers).toHaveLength(3);
            example.numbers.forEach((number) => expectDigits(number, 2));
        }
    });

    test('creates decimal addition examples when requested', () => {
        const examples = generateAddition(12, 2, 3, true);

        expect(examples).toHaveLength(12);
        for (const example of examples) {
            expect(example.type).toBe('addition');
            expect(example.operator).toBe('+');
            expect(example.numbers).toHaveLength(3);
            example.numbers.forEach((number) => {
                expect(number).toMatch(/^\d{2},\d{2}$/);
            });
        }
    });
});

describe('generateSubtraction', () => {
    test('creates non-negative subtraction examples', () => {
        const examples = generateSubtraction(20, 3, 2);

        expect(examples).toHaveLength(20);
        for (const example of examples) {
            expect(example.type).toBe('subtraction');
            expect(example.operator).toBe('-');
            expect(example.numbers).toHaveLength(2);
            expectDigits(example.numbers[0], 3);
            expectDigits(example.numbers[1], 2);
            expect(example.numbers[0] - example.numbers[1]).toBeGreaterThanOrEqual(0);
        }
    });

    test('creates decimal subtraction examples when requested', () => {
        const examples = generateSubtraction(20, 2, 2, true);

        expect(examples).toHaveLength(20);
        for (const example of examples) {
            expect(example.type).toBe('subtraction');
            expect(example.operator).toBe('-');
            expect(example.numbers).toHaveLength(2);
            example.numbers.forEach((number) => {
                expect(number).toMatch(/^\d{2},\d{2}$/);
            });
            expect(Number(example.numbers[0].replace(',', '.')) - Number(example.numbers[1].replace(',', '.')))
                .toBeGreaterThanOrEqual(0);
        }
    });
});

describe('generateMultiplication', () => {
    test('creates multiplication examples within requested digit ranges', () => {
        const examples = generateMultiplication(15, 2, 1);

        expect(examples).toHaveLength(15);
        for (const example of examples) {
            expect(example.type).toBe('multiplication');
            expect(example.operator).toBe('×');
            expect(example.numbers).toHaveLength(2);
            expectDigits(example.numbers[0], 2);
            expectDigits(example.numbers[1], 1);
        }
    });
});

describe('generateDivision', () => {
    test('creates integer division examples with requested digit ranges', () => {
        const examples = generateDivision(20, 3, 1);

        expect(examples).toHaveLength(20);
        for (const example of examples) {
            expect(example.type).toBe('division');
            expectDigits(example.dividend, 3);
            expectDigits(example.divisor, 1);
            expect(example.dividend % example.divisor).toBe(0);
        }
    });

    test('supports same-digit dividend and divisor ranges without retry loops', () => {
        const examples = generateDivision(20, 2, 2);

        expect(examples).toHaveLength(20);
        for (const example of examples) {
            expectDigits(example.dividend, 2);
            expectDigits(example.divisor, 2);
            expect(example.dividend % example.divisor).toBe(0);
        }
    });

    test('throws when divisor digits cannot fit into dividend digits', () => {
        expect(() => generateDivision(1, 1, 3)).toThrow(RangeError);
    });
});

describe('generateExamplesFromSettings', () => {
    const settings = {
        addition: { enabled: true, count: 10, digits: 2, terms: 2, useDecimals: false },
        subtraction: { enabled: false, count: 10, minuendDigits: 2, subtrahendDigits: 2, useDecimals: false },
        multiplication: { enabled: false, count: 10, firstDigits: 2, secondDigits: 2 },
        division: { enabled: false, count: 10, dividendDigits: 3, divisorDigits: 1 }
    };

    test('normalizes counts to whole numbers within the allowed range', () => {
        expect(normalizeCount('')).toBe(0);
        expect(normalizeCount('abc')).toBe(0);
        expect(normalizeCount(-5)).toBe(0);
        expect(normalizeCount('2.7')).toBe(2);
        expect(normalizeCount(5000)).toBe(MAX_EXAMPLES_PER_OPERATION);
    });

    test('caps the number of examples per operation', () => {
        const examples = generateExamplesFromSettings({
            ...settings,
            addition: { ...settings.addition, count: 5000 }
        });

        expect(examples).toHaveLength(MAX_EXAMPLES_PER_OPERATION);
    });
});
