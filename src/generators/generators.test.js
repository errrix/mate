import { describe, expect, test } from 'vitest';
import { generateAddition } from './additionGenerator';
import { generateSubtraction } from './subtractionGenerator';
import { generateMultiplication } from './multiplicationGenerator';
import { generateDivision } from './divisionGenerator';

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
});

describe('generateMultiplication', () => {
    test('creates multiplication examples within requested digit ranges', () => {
        const examples = generateMultiplication(15, 2, 1, 0);

        expect(examples).toHaveLength(15);
        for (const example of examples) {
            expect(example.type).toBe('multiplication');
            expect(example.operator).toBe('×');
            expect(example.numbers).toHaveLength(2);
            expectDigits(example.numbers[0], 2);
            expectDigits(example.numbers[1], 1);
        }
    });

    test('respects maxResult when the selected ranges make it feasible', () => {
        const examples = generateMultiplication(20, 2, 1, 500);

        expect(examples).toHaveLength(20);
        for (const example of examples) {
            expect(example.numbers[0] * example.numbers[1]).toBeLessThanOrEqual(500);
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
});
