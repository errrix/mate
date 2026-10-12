import { getRandomDecimalStringByDigits, getRandomInRange, getRandomNumberByDigits } from './numberUtils';

const MAX_LIMIT_ATTEMPTS = 200;

// Splits a random total that fits the limit into positive terms.
function splitTotalIntoTerms(terms, limit, random) {
    const numbers = [];
    let remaining = getRandomInRange(terms, limit, random);

    for (let termsLeft = terms; termsLeft > 1; termsLeft--) {
        const number = getRandomInRange(1, remaining - (termsLeft - 1), random);
        numbers.push(number);
        remaining -= number;
    }

    numbers.push(remaining);

    return numbers;
}

function getTermsWithinLimit(terms, limit, random) {
    if (limit < terms) {
        throw new RangeError('Невозможно составить сложение с таким пределом.');
    }

    // Independent terms keep every valid example equally likely; splitting a total favours 1 + 1.
    for (let attempt = 0; attempt < MAX_LIMIT_ATTEMPTS; attempt++) {
        const numbers = Array.from({ length: terms }, () => getRandomInRange(1, limit - (terms - 1), random));

        if (numbers.reduce((total, number) => total + number, 0) <= limit) {
            return numbers;
        }
    }

    return splitTotalIntoTerms(terms, limit, random);
}

export function generateAddition(count, digits, terms, useDecimals = false, { limit = 0, random = Math.random } = {}) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        const numbers = [];

        if (limit > 0) {
            numbers.push(...getTermsWithinLimit(terms, limit, random));
        }

        for (let j = numbers.length; j < terms; j++) {
            numbers.push(
                useDecimals
                    ? getRandomDecimalStringByDigits(digits, random)
                    : getRandomNumberByDigits(digits, random)
            );
        }

        examples.push({
            numbers,
            operator: '+',
            type: 'addition'
        });
    }

    return examples;
}
