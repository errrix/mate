import { getRandomNumberByDigits } from './numberUtils';

export function generateAddition(count, digits, terms) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        const numbers = [];

        for (let j = 0; j < terms; j++) {
            numbers.push(getRandomNumberByDigits(digits));
        }

        examples.push({
            numbers,
            operator: '+',
            type: 'addition'
        });
    }

    return examples;
}
