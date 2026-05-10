import { getRandomDecimalStringByDigits, getRandomNumberByDigits } from './numberUtils';

export function generateAddition(count, digits, terms, useDecimals = false) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        const numbers = [];

        for (let j = 0; j < terms; j++) {
            numbers.push(
                useDecimals
                    ? getRandomDecimalStringByDigits(digits)
                    : getRandomNumberByDigits(digits)
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
