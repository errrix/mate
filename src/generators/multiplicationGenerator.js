import { getRandomNumberByDigits } from './numberUtils';

export function generateMultiplication(count, firstDigits, secondDigits, { random = Math.random } = {}) {
    const examples = [];

    for (let i = 0; i < count; i++) {
        const first = getRandomNumberByDigits(firstDigits, random);
        const second = getRandomNumberByDigits(secondDigits, random);

        examples.push({
            numbers: [first, second],
            operator: '×',
            type: 'multiplication'
        });
    }

    return examples;
}
